use crate::modules::presentation::domain::value_objects::Display;

pub fn display(name: &str, x: i32) -> Display {
    Display {
        name: name.to_string(),
        x,
        y: 0,
        width: 1920,
        height: 1080,
        scale_factor: 1.0,
    }
}
