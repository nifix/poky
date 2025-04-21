export default defineNuxtRouteMiddleware((to, from) => {
    const pokyStore = usePokyStore();
    
    if (!!pokyStore.username === false) {
        return navigateTo(
            {
                path: '/',
                query: { error: 'nickname_not_set' }
            });
    }
})