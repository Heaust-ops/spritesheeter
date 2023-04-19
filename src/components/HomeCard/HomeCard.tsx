import { FC, useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Card,
  CardMedia,
  CardActions,
  IconButton,
  CardContent,
  Typography,
} from "@mui/material";
import styles from "./HomeCard.module.css";
import { ImageDataElement } from "../../utils/core";

// Im not deranged this was to somehow attempt to autorevoke url
// but that did not work out
const getImageUrl = (img: File) => {
  return URL.createObjectURL(img);
};

interface HomeCardProps {
  name: string;
  info: ImageDataElement;
  removeImage: (name: string) => void;
}

const HomeCard: FC<HomeCardProps> = ({ info, removeImage, name }) => {
  return (
    <Card
      className={`${styles.wrapper}`}
      sx={{
        maxWidth: 345,
        margin: 1,
        display: "inline-block",
        minWidth: "18rem",
      }}
    >
      <CardContent>
        <CardMedia
          component="img"
          height="194"
          image={getImageUrl(info.img)}
          alt={`${name} thumbnail`}
        />
        <Typography variant="h4">{name}</Typography>
        <CardActions disableSpacing>
          <IconButton
            onClick={() => {
              removeImage(name);
            }}
            aria-label="delete project"
          >
            <DeleteIcon color="error" />
          </IconButton>
        </CardActions>
      </CardContent>
    </Card>
  );
};

export default HomeCard;
