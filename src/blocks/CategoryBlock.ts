import type { Block } from 'payload'

// Hook implementations wrapped in an object so tests can spy on them
export const categoryBlockHooks = {
  beforeValidate: (value: any) => {
    console.log('CategoryBlock.category beforeValidate hook fired with value:', value)
    return value
  },
  beforeChange: (value: any) => {
    console.log('CategoryBlock.category beforeChange hook fired with value:', value)
    return value
  },
  afterChange: (value: any) => {
    console.log('CategoryBlock.category afterChange hook fired with value:', value)
    return value
  },
  afterRead: (value: any) => {
    console.log('CategoryBlock.category afterRead hook fired with value:', value)
    return value
  },
  beforeDuplicate: (value: any) => {
    console.log('CategoryBlock.category beforeDuplicate hook fired with value:', value)
    return value
  },
}

export const CategoryBlock: Block = {
  slug: 'category-block',
  fields: [
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      required: true,
      hooks: {
        beforeValidate: [({ value }) => categoryBlockHooks.beforeValidate(value)],
        beforeChange: [({ value }) => categoryBlockHooks.beforeChange(value)],
        afterChange: [({ value }) => categoryBlockHooks.afterChange(value)],
        afterRead: [({ value }) => categoryBlockHooks.afterRead(value)],
        beforeDuplicate: [({ value }) => categoryBlockHooks.beforeDuplicate(value)],
      },
    },
    {
      name: 'description',
      type: 'text',
    },
  ],
}
