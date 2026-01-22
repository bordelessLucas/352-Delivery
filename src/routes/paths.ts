export const paths = {
    root: '/',
    login: '/login',
    register: '/register',
    home: '/home',
    dashboard: '/dashboard',
    cardapio: '/cardapio',
    pedidos: '/pedidos',
    cupons: '/cupons',
    produtos: '/produtos',
    relatorios: '/relatorios',
    editProfile: '/profile/edit',
    notFound: '*',
} as const;

export type PathKeys = keyof typeof paths;