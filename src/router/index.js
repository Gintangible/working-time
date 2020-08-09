import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

const routers = [
    {
        path: '',
        name: 'Home',
        component: () => import('../pages/home'),
    },
    {
        path: '/calculate-result',
        name: 'calculate-result',
        component: () => import('../pages/calculate-result'),
    }
];

export default new Router({
    routes: routers
});
