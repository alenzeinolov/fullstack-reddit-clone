import { withUrqlClient } from "next-urql";
import Navbar from "../components/Navbar";
import { createUrqlClient } from "../utils/createUrqlClient";

const Index = () => (
  <>
    <Navbar />
    <div>hello world</div>
  </>
);

export default withUrqlClient(createUrqlClient)(Index);
