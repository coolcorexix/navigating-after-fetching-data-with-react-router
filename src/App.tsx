import React from "react";
import {
  Router,
  BrowserRouter,
  Switch,
  Route,
  Link,
  useHistory,
} from "react-router-dom";
import { useEffect } from "react";

const DataContext = React.createContext<any>({
  data: "",
  fetchData: async () => {},
  resetData: () => {},
});

const DataProvider = ({ children }) => {
  const [data, setData] = React.useState<string>("");
  const fetchData = async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        setData("PoC from Nemo");
        resolve(null);
      }, 3000);
    });
  };
  const resetData = () => {
    setData("");
  };

  return (
    <DataContext.Provider
      value={{
        data,
        fetchData,
        resetData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

function APageThatNeedFetchingData() {
  const { data, fetchData } = React.useContext(DataContext);
  useEffect(() => {
    if (!data) {
      fetchData();
    }
  }, [data]);
  if (!data) {
    return <div>Loading...</div>;
  }
  return <div>{data}</div>;
}

function App() {
  const history = useHistory();
  const { data, fetchData, resetData } = React.useContext(DataContext);

  useEffect(() => {
    const unlistenBlocker = history.block((tx) => {
      if (tx.pathname === "/not-have-loading" && !data) {
        fetchData().then(() => {
          history.push(tx.pathname);
        });
        return false;
      }
      return true;
    });
    return () => {
      unlistenBlocker();
    };
  }, [data]);

  return (
    <div className="App">
      <h1>Navigate only after fetching data PoC</h1>

      <div>
        Step 0: click on &nbsp;
        <Link
          onClick={() => {
            resetData();
          }}
          to="/"
        >
          Home (click here to reset data too)
        </Link>
      </div>
      <div>
        Step 1: either click on &nbsp;{" "}
        <Link to="/not-have-loading">
          This link will NOT show loading state
        </Link>{" "}
        or <Link to="/have-loading">This link will show loading state</Link>
        <br />
        Once done, click on the step 0 and click on other link to see the difference
      </div>
      <div></div>

      <Switch>
        <Route path="/have-loading" component={APageThatNeedFetchingData} />
        <Route path="/not-have-loading" component={APageThatNeedFetchingData} />
        <Route path="/" component={null} />
      </Switch>
    </div>
  );
}

export default function OuterApp() {
  return (
    <BrowserRouter>
      <DataProvider>
        <App />
      </DataProvider>
    </BrowserRouter>
  );
}
