/* eslint-disable */
import {FuseNavigationItem} from '@fuse/components/navigation';
import {TranslocoService} from "@ngneat/transloco";

const session = JSON.parse(sessionStorage.getItem('session'));

let sessionUserActiveMenu = []
if (session){
    sessionUserActiveMenu = session?.user.activeMenu[0]
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

let sortedKeys;
if (sessionUserActiveMenu) {
    // Trie les clés de "sessionUserActiveMenu".
    sortedKeys = Object.keys(sessionUserActiveMenu).sort();

}

// Cette fonction construit une structure de menu en utilisant les fonctions précédentes.
function buildMenu(menu,key, currentPath = "") {
    // On filtre les clés des sous-menus (à l'exception de 'root') du menu donné.
    let menuItems = filterRoot(menu);
    // Si le menu est vide, retourne null.
    if (menuItems.length === 0) {
        return null;
    }
    // Mappe les clés des sous-menus en objets de menu avec leurs enfants (récursivement).
    return menuItems.map(item => {
        const subMenu = menu[item];
        const filteredSubmenu = filterRoot(subMenu);
        let menuItem: FuseNavigationItem = {type: undefined}
        if (filteredSubmenu.length == 0){
            menuItem = {
                id: item,
                title: item,
                type: getMenuType(subMenu), // Détermine le type du menu.
                link: `${key}/${item}`
            };
        }
        // Construit le lien en fonction de la présence de sous-menus.
        if (filteredSubmenu.length > 0) {
            menuItem = {
                id: item,
                title: item,
                type: getMenuType(subMenu), // Détermine le type du menu.
                link: `${key}/${item}`
            };
            menuItem.children = buildMenu(filteredSubmenu.reduce((acc, subKey) => {
                acc[subKey] = subMenu[subKey];
                return acc;
            }, {}), menuItem.link);
        }
        return menuItem; // Retourne l'objet du menu.
    });
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
            link: key,
            icon: iconMapping[key],
            type: getMenuType(menu), // Détermine le type du menu.
            children: buildMenu(menu, key), // Construit la structure du menu.
        };
    });
}

export const defaultNavigation: FuseNavigationItem[] = [
    {
        id   : 'example',
        title: 'Example',
        type : 'basic',
        icon : 'heroicons_outline:chart-pie',
        link : '/example'
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
