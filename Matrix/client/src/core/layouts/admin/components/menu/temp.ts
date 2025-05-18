// import { isComponentsPath } from '@/utils/is-components-path';
// import type { RouteRecordRaw } from 'vue-router';

// const isAuthPath = (path: string): boolean => {
//     return path.startsWith('@/views/auth/') || path.startsWith('../views/auth/') || path.startsWith('/src/views/auth/') ||
//         path.startsWith('@/core/views/auth/') || path.startsWith('../core/views/auth/') || path.startsWith('/src/core/views/auth/');
// };

export default (() => {
    // 菜单配置文件
    const menus: Record<string, Page> = {
        ...import.meta.glob('@/views/**/menu.ts', {
            eager: true,
            import: 'default'
        }),
        ...import.meta.glob('@/core/views/**/menu.ts', {
            eager: true,
            import: 'default'
        }),
        ...import.meta.glob('@/modules/**/menu.ts', {
            eager: true,
            import: 'default'
        })
    };

    // 页面配置文件
    const pages: Record<string, Page> = {
        ...import.meta.glob('@/views/**/page.ts', {
            eager: true,
            import: 'default'
        }),
        ...import.meta.glob('@/core/views/**/page.ts', {
            eager: true,
            import: 'default'
        }),
        ...import.meta.glob('@/modules/**/page.ts', {
            eager: true,
            import: 'default'
        })
    };
    
    // 组件文件
    const components: Record<string, () => Promise<unknown>> = {
        ...import.meta.glob('@/views/**/index.vue'),
        ...import.meta.glob('@/core/views/**/index.vue'),
        ...import.meta.glob('@/modules/**/index.vue')
    };

    // 建立一个全局的临时对象来保存所有菜单项，使用完整路径作为唯一键
    // 这里我们定义 children 为可选项
    interface EnhancedSidebarMenu extends Omit<SidebarMenu, 'children'> {
        children?: EnhancedSidebarMenu[];
        title: string;
    }
    
    const globalMenuMap: Record<string, EnhancedSidebarMenu> = {};
    let menu: EnhancedSidebarMenu[] = [];

    for (const key in menus) {
        if (!Object.prototype.hasOwnProperty.call(menus, key)) continue;

        const menuConfig: Page = menus[key];
        if (!menuConfig.menu) continue;

        const path: string = key
            .replace('@/views', '').replace('../views', '').replace('/src/views', '')
            .replace('@/core/views', '').replace('../core/views', '').replace('/src/core/views', '')
            .replace('@/modules/views', '').replace('../modules/views', '').replace('/src/modules/views', '')
            .replace('/menu.ts', '') || '/';

        const segments: string[] = path.split('/').filter((segment: string): boolean => '' !== segment);
        if (0 === segments.length) continue;
        
        // 构建菜单项对象
        const menuItem: EnhancedSidebarMenu = {
            title: menuConfig.title,
            icon: menuConfig.menu.icon,
            order: +menuConfig.menu.order,
            children: [],
            to: {
                name: path
            }
        };
        
        // 处理菜单树结构
        if (1 === segments.length) {
            // 对于一级菜单，使用段名作为键
            const rootKey = `/${segments[0]}`;
            // 检查是否已存在同名菜单
            if (!globalMenuMap[rootKey]) {
                globalMenuMap[rootKey] = menuItem;
                menu.push(menuItem);
            }
            continue;
        }
        
        // 处理多级菜单的情况
        let currentPath = '';
        
        // 遍历路径段，为每个父级路径创建菜单项（如果不存在）
        for (let i = 0; i < segments.length; i++) {
            const segment = segments[i];
            const isLastSegment = i === segments.length - 1;
            
            // 构建当前层级的完整路径作为唯一键
            currentPath = currentPath ? `${currentPath}/${segment}` : `/${segment}`;
            
            // 如果是最后一个段，添加实际菜单项
            if (isLastSegment) {
                if (!globalMenuMap[currentPath]) {
                    globalMenuMap[currentPath] = menuItem;
                    
                    // 找到父级路径
                    const parentPath = currentPath.substring(0, currentPath.lastIndexOf('/'));
                    if (parentPath && globalMenuMap[parentPath]) {
                        // 将当前菜单项添加到父级的children中
                        globalMenuMap[parentPath].children.push(menuItem);
                    } else {
                        // 如果没有父级，添加到根菜单（不应该发生，但为了健壮性）
                        menu.push(menuItem);
                    }
                }
            } else {
                // 处理中间路径节点
                if (!globalMenuMap[currentPath]) {
                    // 如果不存在，创建一个新的父级菜单项
                    const parentItem: EnhancedSidebarMenu = {
                        title: segment, // 使用段名作为标题
                        icon: '', // 默认空图标
                        order: 0, // 默认排序
                        children: [],
                        to: {
                            name: currentPath
                        }
                    };
                    
                    globalMenuMap[currentPath] = parentItem;
                    
                    // 找到父级路径并添加到其children
                    if (i > 0) {
                        const grandParentPath = currentPath.substring(0, currentPath.lastIndexOf('/'));
                        if (grandParentPath && globalMenuMap[grandParentPath]) {
                            globalMenuMap[grandParentPath].children.push(parentItem);
                        } else {
                            // 如果没有祖父级，添加到根菜单
                            menu.push(parentItem);
                        }
                    } else {
                        // 如果是第一级路径，添加到根菜单
                        menu.push(parentItem);
                    }
                }
            }
        }
    }
    
    // 处理页面文件，将页面添加到菜单中
    for (const key in pages) {
        if (!Object.prototype.hasOwnProperty.call(pages, key)) continue;
        
        const pageConfig: Page = pages[key];
        if (!pageConfig.menu) continue; // 没有菜单配置的页面跳过
        
        // 处理路径，与菜单处理保持一致
        const path: string = key
            .replace('@/views', '').replace('../views', '').replace('/src/views', '')
            .replace('@/core/views', '').replace('../core/views', '').replace('/src/core/views', '')
            .replace('@/modules/views', '').replace('../modules/views', '').replace('/src/modules/views', '')
            .replace('/page.ts', '') || '/';
            
        // 生成路由名称，与路由配置的命名规则保持一致
        const routeName = path.split('/').filter(Boolean).join('-') || 'index';
        
        // 构建页面菜单项
        const pageMenuItem: EnhancedSidebarMenu = {
            title: pageConfig.title,
            icon: pageConfig.menu.icon,
            order: +pageConfig.menu.order,
            // 添加路由跳转参数
            to: { name: routeName }
        };
        
        // 根据路径将页面添加到合适的位置
        const segments: string[] = path.split('/').filter((segment: string): boolean => '' !== segment);
        if (segments.length === 0) continue;
        
        // 获取路径的父目录，后面需要将页面添加到这个父目录的children中
        const parentPath = path.substring(0, path.lastIndexOf('/'));
        
        // 如果有父目录，将页面添加到父目录的children中
        if (parentPath && globalMenuMap[parentPath]) {
            // 确保父菜单项有children属性
            if (!globalMenuMap[parentPath].children) {
                globalMenuMap[parentPath].children = [];
            }
            globalMenuMap[parentPath].children.push(pageMenuItem);
        } else {
            // 如果没有父目录，则添加到根菜单中
            menu.push(pageMenuItem);
        }
        
        // 将页面菜单项也添加到全局菜单映射中，以便后续处理
        globalMenuMap[path] = pageMenuItem;
    }
    
    // 递归函数：对菜单项的children按order排序
    const sortMenuByOrder = (items: EnhancedSidebarMenu[]): EnhancedSidebarMenu[] => {
        // 首先对当前级别的菜单项排序
        const sortedItems = [...items].sort((a, b) => a.order - b.order);
        
        // 然后递归排序每个菜单项的children
        return sortedItems.map(item => {
            if (item.children && item.children.length > 0) {
                return {
                    ...item,
                    children: sortMenuByOrder(item.children)
                };
            }
            return item;
        });
    };
    
    // 对整个菜单树进行排序
    menu = sortMenuByOrder(menu);
    return menu;
})
