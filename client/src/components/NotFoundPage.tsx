import { Link } from "react-router";
import FullPageMessage from "./FullPageMessage";

export default function NotFoundPage() {
  return (
    <FullPageMessage>
      <h1 className="text-xl font-semibold text-slate-900">Page not found</h1>
      <Link to="/" className="text-sm font-medium text-teal-700 hover:underline">
        Go to the home screen
      </Link>
    </FullPageMessage>
  );
}