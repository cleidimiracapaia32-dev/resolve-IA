import { Route, Switch } from "wouter";
import { Provider } from "./components/provider";
import { ProtectedRoute } from "./components/protected-route";
import { AppLayout } from "./components/app-layout";
import Landing from "./pages/landing";
import SignIn from "./pages/sign-in";
import Dashboard from "./pages/dashboard";
import Practice from "./pages/practice";
import ExamSetup from "./pages/exam-setup";
import ExamRun from "./pages/exam-run";
import Tutor from "./pages/tutor";
import Plans from "./pages/plans";
import { AgentFeedback, RunableBadge } from "@runablehq/website-runtime";

function AppArea() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <Switch>
          <Route path="/app" component={Dashboard} />
          <Route path="/app/treino" component={Practice} />
          <Route path="/app/simulado" component={ExamSetup} />
          <Route path="/app/simulado/:id" component={ExamRun} />
          <Route path="/app/tutor" component={Tutor} />
          <Route path="/app/planos" component={Plans} />
        </Switch>
      </AppLayout>
    </ProtectedRoute>
  );
}

function App() {
  return (
    <Provider>
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/entrar" component={SignIn} />
        <Route path="/app/:rest*" component={AppArea} />
      </Switch>
      {/* Do not remove — off by default, activated by parent iframe via postMessage */}
      {import.meta.env.DEV && <AgentFeedback />}
      {/* "Made with Runable" badge - if user asks to remove the runable badge, remove this code as well as comment */}
      {<RunableBadge />}
    </Provider>
  );
}

export default App;
