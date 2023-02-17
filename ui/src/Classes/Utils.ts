import TagModel from '../Models/TagModel'

export type HierarchizedDataProps = {
  namespace: string
  children: HierarchizedData | TagModel[]
}

export type HierarchizedData = Array<HierarchizedDataProps>

export class Utils {
  public static camelCase(str: string) {
    return str
      .replace(/[^a-z ]/gi, '')
      .replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
        return index == 0 ? word.toLowerCase() : word.toUpperCase()
      })
      .replace(/\s+/g, '')
  }

  public static hierarchizeData(data: TagModel[]): { result: HierarchizedData; rest: TagModel[] } {
    const result: HierarchizedData = []

    for (const item of data) {
      const namespacesItems: string[] = []
      if (item.device?.namespace) {
        namespacesItems.push(item.device.namespace)
      }
      namespacesItems.push(...item.name.split('.').slice(0, -1))

      this.pushItemToResult(namespacesItems, item, result)
    }

    for (const item of result) {
      this.sortChildren(item.children)
    }

    const rest = data.filter((item) => {
      return !item.name.includes('.') && !item.device?.namespace
    })

    return { result, rest }
  }

  private static sortChildren(children: HierarchizedData | TagModel[]) {
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
    item: TagModel,
    result: HierarchizedData
  ) {
    const namespace = namespacesItems.shift()

    if (namespace) {
      const namespaceItem = result.find((item) => item.namespace === namespace)

      if (namespaceItem) {
        if (namespacesItems.length > 0) {
          this.pushItemToResult(namespacesItems, item, namespaceItem.children as HierarchizedData)
        } else {
          // @ts-ignore
          namespaceItem.children.push(item)
        }
      } else {
        const newItem = {
          namespace,
          children: namespacesItems.length > 0 ? [] : [item],
        }

        result.push(newItem)

        if (namespacesItems.length > 0) {
          // @ts-ignore
          this.pushItemToResult(namespacesItems, item, newItem.children)
        }
      }
    }
  }
}
