import {
  Box,
  Button,
  Flex,
  Heading,
  IconButton,
  Link,
  Stack,
  Text,
} from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import NextLink from "next/link";
import React, { useState } from "react";
import Layout from "../components/Layout";
import {
  useDeletePostMutation,
  useMeQuery,
  usePostsQuery,
} from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";
import Vote from "../components/Vote";
import { DeleteIcon, EditIcon } from "@chakra-ui/icons";

const Index = () => {
  const [variables, setVariables] = useState({
    limit: 15,
    cursor: null as null | string,
  });

  const [{ data: meData }] = useMeQuery();
  const [{ data, fetching }] = usePostsQuery({
    variables,
  });
  const [, deletePost] = useDeletePostMutation();

  if (!fetching && !data) {
    return <div>No data for some reason...</div>;
  }

  return (
    <Layout>
      {fetching && !data ? (
        <div>Loading...</div>
      ) : (
        <Stack spacing={8}>
          {data!.posts.posts.map((post) =>
            !post ? null : (
              <Box key={post.id} p={5} shadow="md" borderWidth="1px">
                <Flex>
                  <Vote post={post} />
                  <Box flex={1}>
                    <NextLink href="/post/[id]" as={`/post/${post.id}`}>
                      <Link>
                        <Heading fontSize="xl">{post.title}</Heading>{" "}
                      </Link>
                    </NextLink>
                    <Text>Posted by {post.creator.username}</Text>
                    <Flex align="center">
                      <Text flex={1} mt={4}>
                        {post.textSnippet}
                      </Text>
                      {meData?.me?.id !== post.creator.id ? null : (
                        <Box>
                          <NextLink
                            href="/post/edit/[id]"
                            as={`/post/edit/${post.id}`}
                          >
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
                            onClick={() => deletePost({ id: post.id })}
                          />
                        </Box>
                      )}
                    </Flex>
                  </Box>
                </Flex>
              </Box>
            )
          )}
        </Stack>
      )}
      {data && data.posts.hasMore ? (
        <Flex>
          <Button
            variant="solid"
            colorScheme="teal"
            mx="auto"
            isLoading={fetching}
            my={8}
            onClick={() =>
              setVariables({
                limit: variables.limit,
                cursor: data.posts.posts[data.posts.posts.length - 1].createdAt,
              })
            }
          >
            Load more
          </Button>
        </Flex>
      ) : null}
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
