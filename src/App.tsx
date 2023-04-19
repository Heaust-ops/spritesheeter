import { useState } from "react";
import "./App.css";
import DownloadsPage from "./components/Downloads/Downloads";
import HomePage from "./components/Home/HomePage";
import { ImageData } from "./utils/core";
import { ThemeProvider, createTheme } from "@mui/material";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

export const Pages = {
  home: HomePage,
  downloads: DownloadsPage,
} as const;

const App = () => {
  const [page, setPage] = useState("home" as keyof typeof Pages);
  const [imageData, setImageData] = useState<ImageData>({});

  return (
    <div className="App">
      <ThemeProvider theme={darkTheme}>{
        {
          home: <HomePage imageData={imageData} setImageData={setImageData} setPage={setPage} />,
          downloads: <DownloadsPage imageData={imageData} setPage={setPage} />,
        }[page]
      }</ThemeProvider>
    </div>
  );
};

export default App;
