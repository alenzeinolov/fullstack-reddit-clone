import {
  Box,
  Button,
  Flex,
  Heading,
  Link,
  Stack,
  Text,
} from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import NextLink from "next/link";
import React, { useState } from "react";
import EditDeleteButtons from "../components/EditDeleteButtons";
import Layout from "../components/Layout";
import Vote from "../components/Vote";
import { usePostsQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";

const Index = () => {
  const [variables, setVariables] = useState({
    limit: 15,
    cursor: null as null | string,
  });

  const [{ data, fetching }] = usePostsQuery({
    variables,
  });

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
                      <EditDeleteButtons
                        id={post.id}
                        creatorId={post.creator.id}
                      />
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
