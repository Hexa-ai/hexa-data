import HierarchizedData from "../Contracts/HierarchizedData";
import DashboardModel from "../Models/DashboardModel";

export type HierarchizedDashboardsList = Array<HierarchizedData<DashboardModel>>;

export default class DashboardsHierarchizer {
  public static hierarchize(dashboards: DashboardModel[]): HierarchizedData<DashboardModel>[] {
    const result: HierarchizedDashboardsList = [];

    for (const dashboard of dashboards) {
      const namespacesItems: string[] =
        dashboard.name.split('.').slice(0, -1);
      this.pushItemToResult(namespacesItems, dashboard, result);
    }

    this.sortChildren(result);

    return result;
  }

  private static sortChildren(children: HierarchizedDashboardsList | DashboardModel[]) {
    children.sort((a, b) => {
      if ('name' in a && 'name' in b) {
        return 0
      }

      if ('name' in a) {
        return 1
      }

      return -1
    })

    for (const child of children) {
      if ('children' in child) {
        this.sortChildren(child.children)
      }
    }
  }

  private static pushItemToResult(
    namespacesItems: string[],
    item: DashboardModel,
    result: HierarchizedDashboardsList
  ) {
    const namespace = namespacesItems.shift();

    if (!namespace) {
      return;
    }

    const namespaceItem = result.find((item) => item.namespace === namespace);

    if (namespaceItem) {
      if (namespacesItems.length > 0) {
        this.pushItemToResult(namespacesItems, item, namespaceItem.children as HierarchizedDashboardsList);
      } else {
        namespaceItem.children.push(item as any);
      }

      return
    }

    const newItem = { namespace, children: namespacesItems.length > 0 ? [] : [item] };

    result.push(newItem);

    if (namespacesItems.length > 0) {
      this.pushItemToResult(namespacesItems, item, newItem.children as any);
    }
  }
}
