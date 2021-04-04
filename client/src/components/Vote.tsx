import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import { Flex, IconButton } from "@chakra-ui/react";
import React, { useState } from "react";
import { PostSnippetFragment, useVoteMutation } from "../generated/graphql";

interface VoteProps {
  post: PostSnippetFragment;
}

const Vote: React.FC<VoteProps> = ({ post }) => {
  const [loadingState, setLoadingState] = useState<
    "upvote-loading" | "downvote-loading" | "not-loading"
  >("not-loading");
  const [, vote] = useVoteMutation();
  return (
    <Flex direction="column" justifyContent="center" alignItems="center" mr={4}>
      <IconButton
        aria-label="Upvote"
        icon={<ChevronUpIcon />}
        isLoading={loadingState === "upvote-loading"}
        colorScheme={post.voteStatus === 1 ? "green" : undefined}
        onClick={async () => {
          if (post.voteStatus === 1) {
            return;
          }
          setLoadingState("upvote-loading");
          await vote({ postId: post.id, value: 1 });
          setLoadingState("not-loading");
        }}
      />
      {post.points}
      <IconButton
        aria-label="Downvote"
        icon={<ChevronDownIcon />}
        isLoading={loadingState === "downvote-loading"}
        colorScheme={post.voteStatus === -1 ? "red" : undefined}
        onClick={async () => {
          if (post.voteStatus === -1) {
            return;
          }
          setLoadingState("downvote-loading");
          await vote({ postId: post.id, value: -1 });
          setLoadingState("not-loading");
        }}
      />
    </Flex>
  );
};

export default Vote;
