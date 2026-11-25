use std::collections::HashMap;
use std::io::{BufRead, BufReader, Read, Write};
use std::path::{Path, PathBuf};
use std::process::{Child, ChildStdin, Stdio};
use std::sync::atomic::{AtomicBool, AtomicU64, Ordering};
use std::sync::mpsc::{self, Sender};
use std::sync::{Arc, Mutex};
use std::thread;
use std::time::{Duration, Instant};

use serde::Deserialize;
use serde_json::{Value, json};

use crate::infrastructure::shell::command;
use crate::modules::projects::domain::errors::ProjectError;
use crate::modules::projects::domain::services::{
    ProjectHost as ProjectHostContract, ProjectHostLauncher,
};

const STDERR_LIMIT: usize = 4_000;
const STOP_TIMEOUT: Duration = Duration::from_secs(10);

type TReply = Result<Value, String>;
type TPending = Arc<Mutex<HashMap<u64, Sender<TReply>>>>;

struct ProjectHost {
    child: Mutex<Child>,
    stdin: Mutex<Option<ChildStdin>>,
    pending: TPending,
    is_closed: Arc<AtomicBool>,
    next_id: AtomicU64,
}

#[derive(Deserialize)]
struct Response {
    id: Option<u64>,
    result: Option<Value>,
    error: Option<ResponseError>,
}

#[derive(Deserialize)]
struct ResponseError {
    message: String,
}

impl ProjectHost {
    fn start(node: &Path, script: &Path) -> Result<ProjectHost, String> {
        let mut child = command(node)
            .arg(script)
            .stdin(Stdio::piped())
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .spawn()
            .map_err(|error| format!("Could not start Node.js at {}: {error}", node.display()))?;
        let stdin = child.stdin.take();
        let stdout = child.stdout.take().ok_or("The host has no output.")?;
        let stderr = child.stderr.take().ok_or("The host has no error output.")?;
        let pending = TPending::default();
        let is_closed = Arc::new(AtomicBool::new(false));
        let errors = Arc::new(Mutex::new(String::new()));

        thread::spawn({
            let errors = Arc::clone(&errors);

            move || collect_errors(stderr, &errors)
        });
        thread::spawn({
            let pending = Arc::clone(&pending);
            let is_closed = Arc::clone(&is_closed);

            move || {
                for line in BufReader::new(stdout).lines().map_while(Result::ok) {
                    deliver(&pending, &line);
                }

                is_closed.store(true, Ordering::SeqCst);

                let output = errors.lock().unwrap().trim().to_string();
                let message = if output.is_empty() {
                    "The Slidevision host stopped unexpectedly.".to_string()
                } else {
                    format!("The Slidevision host stopped unexpectedly.\n\n{output}")
                };

                for (_, reply) in pending.lock().unwrap().drain() {
                    let _ = reply.send(Err(message.clone()));
                }
            }
        });

        Ok(ProjectHost {
            child: Mutex::new(child),
            stdin: Mutex::new(stdin),
            pending,
            is_closed,
            next_id: AtomicU64::new(1),
        })
    }

    fn request(&self, method: &str, params: Value) -> TReply {
        let id = self.next_id.fetch_add(1, Ordering::SeqCst);
        let (reply, response) = mpsc::channel();

        self.pending.lock().unwrap().insert(id, reply);

        if let Err(error) = self.write(id, method, params) {
            self.pending.lock().unwrap().remove(&id);

            return Err(error);
        }

        response
            .recv()
            .map_err(|_| "The Slidevision host stopped unexpectedly.".to_string())?
    }

    fn shutdown(&self) {
        self.stdin.lock().unwrap().take();

        let mut child = self.child.lock().unwrap();
        let deadline = Instant::now() + STOP_TIMEOUT;

        while Instant::now() < deadline {
            match child.try_wait() {
                Ok(Some(_)) => return,
                Ok(None) => thread::sleep(Duration::from_millis(50)),
                Err(_) => break,
            }
        }

        let _ = child.kill();
        let _ = child.wait();
    }

    fn write(&self, id: u64, method: &str, params: Value) -> Result<(), String> {
        if self.is_closed.load(Ordering::SeqCst) {
            return Err("The Slidevision host is not running.".to_string());
        }

        let mut stdin = self.stdin.lock().unwrap();
        let stdin = stdin
            .as_mut()
            .ok_or("The Slidevision host is not running.")?;
        let line = json!({
            "id": id,
            "method": method,
            "params": params,
        });

        writeln!(stdin, "{line}")
            .and_then(|()| stdin.flush())
            .map_err(|error| format!("Could not reach the Slidevision host: {error}"))
    }
}

impl ProjectHostContract for ProjectHost {
    fn open(&self, root: &str) -> Result<Value, ProjectError> {
        self.request(
            "open",
            json!({
                "root": root,
            }),
        )
        .map_err(ProjectError::Host)
    }

    fn stop(&self) {
        self.shutdown();
    }
}

pub struct Launcher {
    script: PathBuf,
}

impl Launcher {
    pub fn new(script: PathBuf) -> Self {
        Self { script }
    }
}

impl ProjectHostLauncher for Launcher {
    fn launch(&self, node: &Path) -> Result<Box<dyn ProjectHostContract>, ProjectError> {
        ProjectHost::start(node, &self.script)
            .map(|host| Box::new(host) as Box<dyn ProjectHostContract>)
            .map_err(ProjectError::Host)
    }
}

fn deliver(pending: &TPending, line: &str) {
    let Ok(response) = serde_json::from_str::<Response>(line) else {
        return;
    };
    let Some(id) = response.id else {
        return;
    };
    let Some(reply) = pending.lock().unwrap().remove(&id) else {
        return;
    };
    let result = match response.error {
        Some(error) => Err(error.message),
        None => Ok(response.result.unwrap_or(Value::Null)),
    };

    let _ = reply.send(result);
}

fn collect_errors(mut stderr: impl Read, errors: &Mutex<String>) {
    let mut buffer = [0; 1_024];

    while let Ok(read) = stderr.read(&mut buffer) {
        if read == 0 {
            break;
        }

        let mut errors = errors.lock().unwrap();

        errors.push_str(&String::from_utf8_lossy(&buffer[..read]));

        if errors.len() > STDERR_LIMIT {
            let mut start = errors.len() - STDERR_LIMIT;

            while !errors.is_char_boundary(start) {
                start += 1;
            }

            errors.drain(..start);
        }
    }
}
