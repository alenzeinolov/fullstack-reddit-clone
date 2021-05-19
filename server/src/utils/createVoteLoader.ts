import DataLoader from "dataloader";
import { Vote } from "../entities/Vote";

export const createVoteLoader = () =>
  new DataLoader<{ postId: number; userId: number }, Vote | null>(
    async (keys) => {
      const votes = await Vote.findByIds(keys as any);
      const voteIdstoVote: Record<string, Vote> = {};
      votes.forEach((vote) => {
        voteIdstoVote[`${vote.userId}|${vote.postId}`] = vote;
      });
      return keys.map((key) => voteIdstoVote[`${key.userId}|${key.postId}`]);
    }
  );
