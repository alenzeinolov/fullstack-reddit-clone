import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import { Flex, IconButton } from "@chakra-ui/react";
import React from "react";
import { PostSnippetFragment, useVoteMutation } from "../generated/graphql";

interface VoteProps {
  post: PostSnippetFragment;
}

const Vote: React.FC<VoteProps> = ({ post }) => {
  const [, vote] = useVoteMutation();
  return (
    <Flex direction="column" justifyContent="center" alignItems="center" mr={4}>
      <IconButton
        aria-label="Upvote"
        icon={<ChevronUpIcon />}
        onClick={() => vote({ postId: post.id, value: 1 })}
      />
      {post.points}
      <IconButton
        aria-label="Downvote"
        icon={
          <ChevronDownIcon
            onClick={() => vote({ postId: post.id, value: -1 })}
          />
        }
      />
    </Flex>
  );
};

export default Vote;
