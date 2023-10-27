/* eslint-disable */
import { FuseNavigationItem } from '@fuse/components/navigation';

const session = JSON.parse(sessionStorage.getItem('session'));
console.log(session)

let sessionUserActiveMenu = []
console.log('=>',sessionUserActiveMenu)
if (session){
    sessionUserActiveMenu = session?.user.activeMenu[0]
}
else { sessionUserActiveMenu = null }


for (const menuItem in sessionUserActiveMenu) {
    console.log(`MENU=====>>: ${menuItem}`);
    const subMenu = sessionUserActiveMenu[menuItem];
    for (const subMenuItem in subMenu) {
        console.log(`Sous-menu: ${subMenuItem}`);
        const suSubMenu = subMenu[subMenuItem]
        for (const subSubMenu in suSubMenu){
            console.log(`Sous-Sous-menu: ${subSubMenu}`)
        }
    }
}


const iconMapping = {
    accounting: 'heroicons_outline:adjustments-vertical',
    contact: 'heroicons_outline:user',
    health: 'heroicons_outline:plus',
    hr: 'heroicons_outline:user-group',
    men: 'heroicons_outline:briefcase',
    income: 'expand',
    expense: 'expand',
    settings: 'heroicons_outline:cog',
    dashboard: 'heroicons_outline:bars-4',
    inventory: 'heroicons_outline:square-3-stack-3d',
    maintenance: 'heroicons_outline:wrench-screwdriver',
};
// Cette fonction prend un objet "menu" en entrée et retourne un type de menu (basic, collapsable).
function getMenuType(menu) {
    // On obtient les clés des sous-menus (à l'exception de 'root') dans "menu".
    const subMenuKeys = Object.keys(menu).filter(subKey => subKey !== 'root');

    // Si le nombre de sous-menus est égal à zéro, c'est un menu de type "basic".
    if (subMenuKeys.length === 0) {
        return 'basic';
    }
    // Sinon, si au moins un sous-menu a des sous-sous-menus, c'est un menu de type "collapsable".
    else if (subMenuKeys.some(subKey => Object.keys(menu[subKey]).filter(subSubKey => subSubKey !== 'root').length > 0)) {
        return 'collapsable';
    }
    // Sinon, c'est encore un menu de type "collapsable".
    else {
        return 'collapsable';
    }
}

// Cette fonction filtre les clés des sous-menus (à l'exception de 'root') d'un sous-menu donné.
function filterRoot(subMenu) {
    return Object.keys(subMenu).filter(subKey => subKey !== 'root');
}

// Cette fonction construit une structure de menu en utilisant les fonctions précédentes.
function buildMenu(menu) {
    // On filtre les clés des sous-menus (à l'exception de 'root') du menu donné.
    const menuItems = filterRoot(menu);

    // Si le menu est vide, retourne null.
    if (menuItems.length === 0) {
        return null;
    }

    // Mappe les clés des sous-menus en objets de menu avec leurs enfants (récursivement).
    return menuItems.map(item => {
        const subMenu = menu[item];
        const filteredSubmenu = filterRoot(subMenu);
        const menuItem: FuseNavigationItem = {
            id: item,
            title: item,
            type: getMenuType(subMenu), // Détermine le type du menu.
            icon: iconMapping[item], // Associe une icône au menu.
        };

        // S'il y a des sous-sous-menus, les construit récursivement.
        if (filteredSubmenu.length > 0) {
            menuItem.children = buildMenu(filteredSubmenu.reduce((acc, subKey) => {
                acc[subKey] = subMenu[subKey];
                return acc;
            }, {}));
        }
        console.log(menuItem)
        return menuItem; // Retourne l'objet du menu.
    });
}

let sortedKeys;
if (sessionUserActiveMenu) {
    // Trie les clés de "sessionUserActiveMenu".
    sortedKeys = Object.keys(sessionUserActiveMenu).sort();
}

// Initialise un tableau vide pour stocker la nouvelle structure de menu.
export let newNavigation: FuseNavigationItem[] | null = [];

if (sortedKeys) {
    // Mappe les clés triées en objets de menu en utilisant les fonctions précédentes.
    newNavigation = sortedKeys.map(key => {
        const menu = sessionUserActiveMenu[key];

        return {
            id: key,
            title: key,
            icon: iconMapping[key],
            type: getMenuType(menu), // Détermine le type du menu.
            children: buildMenu(menu), // Construit la structure du menu.
        };
    });
}

console.log(newNavigation);

export const defaultNavigation: FuseNavigationItem[] = [
    {
        id   : 'example',
        title: 'Example',
        type : 'basic',
        icon : 'heroicons_outline:chart-pie',
        link : '/example'
    },
    {
        id   : 'revenus',
        title: 'Revenus',
        type : 'collapsable',
        icon : 'heroicons_outline:banknotes',
        children: [
            {
                id   : 'liste',
                title: 'Liste',
                type : 'basic',
                link : '/revenus'
            },
            {
                id   : 'facturation',
                title: 'Facturation',
                type : 'basic',
                link : '/facturation'
            },
            {
                id   : 'recherche',
                title: 'Recherche',
                type : 'basic',
                link : '/invoiceSearch'
            }
            ]
    },
    {
        id   : 'requete',
        title: 'Requête',
        type : 'basic',
        icon : 'heroicons_outline:chart-pie',
        link : '/requete'
    },
];
export const compactNavigation: FuseNavigationItem[] = [
    {
        id   : 'example',
        title: 'Example',
        type : 'basic',
        icon : 'heroicons_outline:chart-pie',
        link : '/example'
    }
];
export const futuristicNavigation: FuseNavigationItem[] = [
    {
        id   : 'example',
        title: 'Example',
        type : 'basic',
        icon : 'heroicons_outline:chart-pie',
        link : '/example'
    }
];
export const horizontalNavigation: FuseNavigationItem[] = [
    {
        id   : 'example',
        title: 'Example',
        type : 'basic',
        icon : 'heroicons_outline:chart-pie',
        link : '/example',

    }
];
