import { Suspense } from "react";
import Spinner from "../../../../views/spinner/Spinner";

// eslint-disable-next-line no-unused-vars
const Loadable = (Component) => (props) =>
  (
    <Suspense fallback={<Spinner />}>
      <Component {...props} />
    </Suspense>
  );

export default Loadable;