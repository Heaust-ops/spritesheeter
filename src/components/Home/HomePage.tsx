import { FC, useState, DragEvent } from "react";
import { ImageData } from "../../utils/core";
import { Button, CircularProgress } from "@mui/material";
import styles from "./HomePage.module.css";
import HomeCard from "../HomeCard/HomeCard";
import { Pages } from "../../App";

interface HomePageProps {
  setImageData: (arg: ImageData) => void;
  imageData: ImageData;
  setPage: (page: keyof typeof Pages) => void;
}

/** DROP BOX */
const DropBox: FC<{
  imageData: ImageData;
  setImageData: (arg: ImageData) => void;
}> = ({ imageData, setImageData }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState("");

  const handleDrop = async (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const fileList = event.dataTransfer?.files;
    if (fileList?.length === 0) return;

    const newData = {} as ImageData;

    for (const file of fileList) {
      if (!file.type.includes("image")) continue;
      const name = file.name;

      /** throw error If route already exists */
      if (Object.keys(imageData).includes(name)) {
        setIsError("Image Already Exists.");
        continue;
      }

      // Infer Natural Dimensions and add it to the list
      await new Promise<void>((r, _) => {
        const url = URL.createObjectURL(file);
        const imageElement = new Image();
        imageElement.onload = () => {
          newData[name] = {
            img: file,
            width: imageElement.naturalWidth,
            height: imageElement.naturalHeight,
          };

          imageElement.remove();
          URL.revokeObjectURL(url);
          r();
        };
        imageElement.src = url;
      });
    }

    setImageData({ ...imageData, ...newData });
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(event) => event.preventDefault()}
      className={`${styles.dndWrapper}`}
    >
      {isLoading ? (
        <CircularProgress
          color="primary"
          size="lg"
          thickness={2.5}
          className={`${styles.dndSpinner}`}
        />
      ) : (
        <p
          style={isError ? { color: "#ff7e7e", opacity: 1 } : {}}
          className={`unselectable`}
        >
          {isError ? isError : "Drop your images here!"}
        </p>
      )}
    </div>
  );
};

const HomePage: FC<HomePageProps> = ({ imageData, setImageData, setPage }) => {
  const removeImage = (name: string) => {
    const data = { ...imageData };
    for (const k in data) if (k === name) delete data[k];
    setImageData(data);
  };

  const isImageData = Object.keys(imageData).length > 0;

  return (
    <div className={`${styles.container}`}>
      <div
        style={
          isImageData ? {} : { transform: `translateY(50%) scale(${1.5})` }
        }
        className={`${styles.headContainer}`}
      >
        <DropBox imageData={imageData} setImageData={setImageData} />
        {isImageData && (
          <Button
            onClick={() => {
              if (isImageData) setPage("downloads");
            }}
            variant="contained"
          >
            Sheet it!
          </Button>
        )}
      </div>
      <br />
      {Object.keys(imageData).map((el, i) => (
        <HomeCard
          name={el}
          removeImage={removeImage}
          key={i}
          info={imageData[el]}
        />
      ))}
    </div>
  );
};

export default HomePage;
