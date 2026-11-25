interface IRoute {
  name?: string;
  path: string;
  component: () => Promise<unknown>;
}

export default function setupSlidevisionRoutes(routes: IRoute[]): IRoute[] {
  return [
    {
      name: 'slidevision-overview',
      path: '/__slidevision-overview',
      component: () => import('../pages/SlidevisionOverview.vue'),
    },
    ...routes,
  ];
}
