import { getPayload, Payload } from 'payload'
import config from '@/payload.config'
import { postsCollectionHooks } from '@/collections/Posts'
import { categoryBlockHooks } from '@/blocks/CategoryBlock'

import { describe, it, beforeAll, beforeEach, afterEach, expect, vi } from 'vitest'

let payload: Payload

describe('Field Hooks in Lexical Blocks', () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
  })

  beforeEach(() => {
    // Spy on all hook methods
    vi.spyOn(postsCollectionHooks, 'beforeValidate')
    vi.spyOn(postsCollectionHooks, 'beforeChange')
    vi.spyOn(postsCollectionHooks, 'afterChange')
    vi.spyOn(postsCollectionHooks, 'afterRead')
    vi.spyOn(postsCollectionHooks, 'beforeDuplicate')

    vi.spyOn(categoryBlockHooks, 'beforeValidate')
    vi.spyOn(categoryBlockHooks, 'beforeChange')
    vi.spyOn(categoryBlockHooks, 'afterChange')
    vi.spyOn(categoryBlockHooks, 'afterRead')
    vi.spyOn(categoryBlockHooks, 'beforeDuplicate')
  })

  afterEach(() => {
    // Restore original implementations after each test
    vi.restoreAllMocks()
  })

  describe('Direct Relationship Fields (Control)', () => {
    let categoryId: number
    let postId: number

    beforeAll(async () => {
      const category = await payload.create({
        collection: 'categories',
        data: {
          name: 'Test Category',
          description: 'A test category for control test',
        },
      })
      categoryId = category.id as number
    })

    it('should fire beforeValidate, beforeChange, and afterChange hooks on create', async () => {
      const post = await payload.create({
        collection: 'posts',
        data: {
          title: 'Test Post',
          category: categoryId,
        },
      })

      postId = post.id as number

      expect(postsCollectionHooks.beforeValidate).toHaveBeenCalled()
      expect(postsCollectionHooks.beforeChange).toHaveBeenCalled()
      expect(postsCollectionHooks.afterChange).toHaveBeenCalled()
    })

    it('should fire afterRead hook on read', async () => {
      await payload.findByID({
        collection: 'posts',
        id: postId,
      })

      expect(postsCollectionHooks.afterRead).toHaveBeenCalled()
    })

    it('should fire beforeDuplicate hook on duplicate', async () => {
      const duplicatedPost = await payload.duplicate({
        collection: 'posts',
        id: postId,
      })

      expect(postsCollectionHooks.beforeDuplicate).toHaveBeenCalled()
      expect(duplicatedPost.id).not.toBe(postId)
    })
  })

  describe('Block Relationship Fields in Lexical (BUG)', () => {
    let categoryId: number
    let articleId: number

    const createArticleWithBlock = async (title: string) => {
      return payload.create({
        collection: 'articles',
        data: {
          title,
          content: {
            root: {
              type: 'root',
              children: [
                {
                  type: 'block',
                  version: 2,
                  fields: {
                    blockType: 'category-block',
                    category: categoryId,
                    description: 'A category block',
                  },
                },
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              version: 1,
            },
          },
        },
      })
    }

    beforeAll(async () => {
      const category = await payload.create({
        collection: 'categories',
        data: {
          name: 'Block Category',
          description: 'A test category for block test',
        },
      })
      categoryId = category.id as number
    })

    it('should fire beforeValidate, beforeChange, and afterChange hooks on create (BUG: they do not)', async () => {
      const article = await createArticleWithBlock('Test Article')
      articleId = article.id as number

      // BUG: These hooks do NOT fire for relationship fields in Lexical blocks
      expect(categoryBlockHooks.beforeValidate).toHaveBeenCalled()
      expect(categoryBlockHooks.beforeChange).toHaveBeenCalled()
      expect(categoryBlockHooks.afterChange).toHaveBeenCalled()
    })

    it('should fire afterRead hook on read', async () => {
      await payload.findByID({
        collection: 'articles',
        id: articleId,
      })

      // This hook works though
      expect(categoryBlockHooks.afterRead).toHaveBeenCalled()
    })

    it('should fire beforeDuplicate hook on duplicate (BUG: it does not)', async () => {
      const duplicatedArticle = await payload.duplicate({
        collection: 'articles',
        id: articleId,
      })

      // BUG: beforeDuplicate does NOT fire for relationship fields in Lexical blocks
      expect(categoryBlockHooks.beforeDuplicate).toHaveBeenCalled()
      expect(duplicatedArticle.id).not.toBe(articleId)
    })
  })
})
