import type { CollectionConfig } from 'payload'

// Hook implementations wrapped in an object so tests can spy on them
export const postsCollectionHooks = {
  beforeValidate: (value: any) => {
    console.log('Posts.category beforeValidate hook fired with value:', value)
    return value
  },
  beforeChange: (value: any) => {
    console.log('Posts.category beforeChange hook fired with value:', value)
    return value
  },
  afterChange: (value: any) => {
    console.log('Posts.category afterChange hook fired with value:', value)
    return value
  },
  afterRead: (value: any) => {
    console.log('Posts.category afterRead hook fired with value:', value)
    return value
  },
  beforeDuplicate: (value: any) => {
    console.log('Posts.category beforeDuplicate hook fired with value:', value)
    return value
  },
}

export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      hooks: {
        beforeValidate: [({ value }) => postsCollectionHooks.beforeValidate(value)],
        beforeChange: [({ value }) => postsCollectionHooks.beforeChange(value)],
        afterChange: [({ value }) => postsCollectionHooks.afterChange(value)],
        afterRead: [({ value }) => postsCollectionHooks.afterRead(value)],
        beforeDuplicate: [({ value }) => postsCollectionHooks.beforeDuplicate(value)],
      },
    },
  ],
}
