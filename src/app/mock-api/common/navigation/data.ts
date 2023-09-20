/* eslint-disable */
import { FuseNavigationItem } from '@fuse/components/navigation';

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
        //link : '/revenus',
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
                link : '/invoiceAdd'
            },
            {
                id   : 'recherche',
                title: 'Recherche',
                type : 'basic',
                link : ''
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
