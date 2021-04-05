import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  InputType,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
  UseMiddleware,
} from "type-graphql";
import { getConnection } from "typeorm";
import { Post } from "../entities/Post";
import { Vote } from "../entities/Vote";
import { isAuth } from "../middleware/isAuth";
import { MyContext } from "../types";

@ObjectType()
class PaginatedPosts {
  @Field(() => [Post])
  posts: Post[];
  @Field()
  hasMore: boolean;
}

@InputType()
class PostInput {
  @Field()
  title!: string;
  @Field()
  text!: string;
}

@Resolver(Post)
export class PostResolver {
  @FieldResolver(() => String)
  textSnippet(@Root() root: Post) {
    return root.text.slice(0, 50);
  }

  @Query(() => PaginatedPosts)
  async posts(
    @Ctx() { req }: MyContext,
    @Arg("limit", () => Int) limit: number,
    @Arg("cursor", () => String, { nullable: true }) cursor: string | null
  ): Promise<PaginatedPosts> {
    const realLimit = Math.min(50, limit);
    const fakeLimit = realLimit + 1;

    const replacements: any[] = [fakeLimit];

    if (req.session.userId) {
      replacements.push(req.session.userId);
    }

    let cursorIdx = 3;
    if (cursor) {
      replacements.push(new Date(parseInt(cursor)));
      cursorIdx = replacements.length;
    }

    const posts = await getConnection().query(
      `
      select p.*,
      json_build_object(
        'id', u.id,
        'username', u.username,
        'email', u.email
      ) creator,
      ${
        req.session.userId
          ? `(select value from "vote" where "userId" = $2 and "postId" = p.id) "voteStatus"`
          : 'null as "voteStatus"'
      }
      from post p
      inner join "user" u on u.id = p."creatorId"
      ${cursor ? `where p."createdAt" < $${cursorIdx}` : ""}
      order by "createdAt" DESC
      limit $1
      `,
      replacements
    );

    // const qb = getConnection()
    //   .getRepository(Post)
    //   .createQueryBuilder("p")
    //   .orderBy('"createdAt"', "DESC")
    //   .take(fakeLimit);

    // if (cursor) {
    //   qb.where('"createdAt" < :cursor', {
    //     cursor: new Date(parseInt(cursor)),
    //   });
    // }

    return {
      posts: posts.slice(0, realLimit),
      hasMore: posts.length === fakeLimit,
    };
  }

  @Query(() => Post, { nullable: true })
  async post(@Arg("id", () => Int) id: number): Promise<Post | undefined> {
    return Post.findOne(id, { relations: ["creator"] });
  }

  @Mutation(() => Post)
  @UseMiddleware(isAuth)
  async createPost(
    @Ctx() { req }: MyContext,
    @Arg("options") options: PostInput
  ): Promise<Post> {
    return Post.create({ ...options, creatorId: req.session.userId }).save();
  }

  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Arg("id") id: number,
    @Arg("title", { nullable: true }) title: string
  ): Promise<Post | null> {
    const post = await Post.findOne(id);
    if (!post) {
      return null;
    }

    if (typeof title !== "undefined") {
      Post.update({ id }, { title });
    }

    return post;
  }

  @Mutation(() => Boolean)
  async deletePost(@Arg("id") id: number): Promise<boolean> {
    await Post.delete({ id });

    return true;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async vote(
    @Ctx() { req }: MyContext,
    @Arg("postId", () => Int) postId: number,
    @Arg("value", () => Int) value: number
  ): Promise<boolean> {
    const { userId } = req.session;
    const isUpvote = value !== -1;
    const vote = isUpvote ? 1 : -1;

    const voteItem = await Vote.findOne({ where: { postId, userId } });
    if (voteItem && voteItem.value !== vote) {
      await getConnection().transaction(async (tm) => {
        tm.query(
          `
          update "vote"
          set value = $1
          where "postId" = $2 and "userId" = $3;
          `,
          [vote, postId, userId]
        );

        tm.query(
          `
          update "post"
          set points = points + $1
          where id = $2;
          `,
          [2 * vote, postId]
        );
      });
    } else if (!voteItem) {
      await getConnection().transaction(async (tm) => {
        tm.query(
          `
          insert into "vote" ("value", "postId", "userId")
          values ($1, $2, $3);
          `,
          [vote, postId, userId]
        );

        tm.query(
          `
          update "post"
          set points = points + $1
          where id = $2;
          `,
          [vote, postId]
        );
      });
    }

    return true;
  }
}
