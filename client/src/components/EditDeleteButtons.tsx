import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { Box, IconButton, Link } from "@chakra-ui/react";
import NextLink from "next/link";
import React from "react";
import { useDeletePostMutation, useMeQuery } from "../generated/graphql";

interface EditDeleteButtonsProps {
  id: number;
  creatorId: number;
}

const EditDeleteButtons: React.FC<EditDeleteButtonsProps> = ({
  id,
  creatorId,
}) => {
  const [{ data: meData }] = useMeQuery();
  const [, deletePost] = useDeletePostMutation();

  if (meData?.me?.id !== creatorId) {
    return null;
  }

  return (
    <Box>
      <NextLink href="/post/edit/[id]" as={`/post/edit/${id}`}>
        <IconButton
          as={Link}
          mr={4}
          aria-label="Edit Post"
          colorScheme="gray"
          icon={<EditIcon />}
        />
      </NextLink>
      <IconButton
        aria-label="Delete Post"
        colorScheme="gray"
        icon={<DeleteIcon />}
        onClick={() => deletePost({ id })}
      />
    </Box>
  );
};

export default EditDeleteButtons;
