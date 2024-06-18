export interface SidebarItem {
    title: string;
    icon: string;
    link: string;
    header?: string;
    group: string;
    category: string;
}

export const useSidebarStore = defineStore('sidebar', () => {
    // Sadly icon name needs to exist in the Sidebar / Search component as icon component
    // Shipping them from the store would cause an error
    const items: Ref<Array<SidebarItem>> = ref([
        { title: 'Start', icon: 'Home', link: '/', group: 'Standard', category: 'home' },
        { title: 'Räume', icon: 'Cuboid', link: '/rooms', group: 'Standard', category: 'rooms' },
        { title: 'Kalender', icon: 'Calendar', link: '/calendars', group: 'Standard', category: 'calendars' },
        { title: 'Termine', icon: 'SquareGanttChart', link: '/events', group: 'Standard', category: 'events' },
        { title: 'Tags', icon: 'Tv2', link: '/tags', group: 'Standard', category: 'tags' },
        {
            header: 'Verwaltung',
            title: 'Benutzer',
            icon: 'Users',
            link: '/users',
            group: 'Verwaltung',
            category: 'users'
        }
    ]);

    return { items };
});
