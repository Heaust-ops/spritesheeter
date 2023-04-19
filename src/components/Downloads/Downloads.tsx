import { FC, useEffect, useRef, useState } from "react";
import {
  ImageData,
  downloadJSON,
  downloadSpriteData,
  drawSpriteData,
  getPackedSprites,
} from "../../utils/core";
import { Pages } from "../../App";
import styles from "./Downloads.module.css";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import {
  Button,
  ButtonGroup,
  ClickAwayListener,
  Grow,
  MenuItem,
  MenuList,
  Paper,
  Popper,
} from "@mui/material";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { getCode } from "../../utils/code/builder";

interface DownloadsPageProps {
  imageData: ImageData;
  setPage: (page: keyof typeof Pages) => void;
}

const options = [
  "Download as PNG",
  "Download as WebP",
  "Download as JPEG",
  "Download Coordinate JSON",
] as const;

const languages = ["Javascript", "TypeScript"] as const;

const DownloadsPage: FC<DownloadsPageProps> = ({ imageData }) => {
  const canvasRef = useRef(null);
  const [lang, setLang] = useState("Javascript" as keyof typeof languages);

  const spriteData = getPackedSprites(imageData);
  useEffect(() => {
    if (!canvasRef.current) return;
    const cnv = canvasRef.current as HTMLCanvasElement;
    drawSpriteData(cnv, spriteData);
  }, [imageData]);

  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(1);

  const handleClick = () => {
    /** Download sprite sheet */
    if (options[selectedIndex].includes("as"))
      downloadSpriteData(
        spriteData,
        options[selectedIndex].split(" ").reverse()[0].toLowerCase()
      );
    /** Download sprite sheet json */ else if (
      options[selectedIndex].includes("JSON")
    ) {
      const packedSprites = getPackedSprites(imageData);
      const coords = {} as Record<
        string,
        { position: [number, number]; dimensions: [number, number] }
      >;
      for (const k in packedSprites) {
        const { startX, startY, width, height } = packedSprites[k];
        coords[k] = { position: [startX, startY], dimensions: [width, height] };
      }
      downloadJSON(JSON.stringify(coords), "spriteSheetCoords");
    }
  };

  const handleMenuItemClick = (
    event: React.MouseEvent<HTMLLIElement, MouseEvent>,
    index: number
  ) => {
    setSelectedIndex(index);
    setOpen(false);
  };

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event: Event) => {
    if (
      anchorRef.current &&
      anchorRef.current.contains(event.target as HTMLElement)
    ) {
      return;
    }

    setOpen(false);
  };

  return (
    <div className={`${styles.container}`}>
      <div className={`${styles.sheetContainer}`}>
        <h1>Enjoy your SpriteSheet!</h1>
        <canvas className={`${styles.canvas}`} ref={canvasRef}></canvas>
        <br />
        <br />
        <div className={`${styles.downloadButton}`}>
          <ButtonGroup
            variant="contained"
            ref={anchorRef}
            aria-label="split button"
          >
            <Button onClick={handleClick}>{options[selectedIndex]}</Button>
            <Button
              size="small"
              aria-controls={open ? "split-button-menu" : undefined}
              aria-expanded={open ? "true" : undefined}
              aria-label="select merge strategy"
              aria-haspopup="menu"
              onClick={handleToggle}
            >
              <ArrowDropDownIcon />
            </Button>
          </ButtonGroup>
          <Popper
            sx={{
              zIndex: 1,
            }}
            open={open}
            anchorEl={anchorRef.current}
            role={undefined}
            transition
            disablePortal
          >
            {({ TransitionProps, placement }) => (
              <Grow
                {...TransitionProps}
                style={{
                  transformOrigin:
                    placement === "bottom" ? "center top" : "center bottom",
                }}
              >
                <Paper>
                  <ClickAwayListener onClickAway={handleClose}>
                    <MenuList id="split-button-menu" autoFocusItem>
                      {options.map((option, index) => (
                        <MenuItem
                          key={option}
                          selected={index === selectedIndex}
                          onClick={(event) => handleMenuItemClick(event, index)}
                        >
                          {option}
                        </MenuItem>
                      ))}
                    </MenuList>
                  </ClickAwayListener>
                </Paper>
              </Grow>
            )}
          </Popper>
        </div>
      </div>
      {/**
       * CODE BLOCK
       */}
      <div className={`${styles.codeContainer}`}>
        <div className={`${styles.codeContainerHeader}`}>
          {languages.map((el) => (
            <Button
              sx={{ marginRight: "0.2rem" }}
              variant={
                lang === (el as keyof typeof languages)
                  ? "outlined"
                  : "contained"
              }
              disabled={lang === (el as keyof typeof languages)}
              onClick={() => {
                setLang(el as keyof typeof languages);
              }}
              key={el}
              className={`${styles.languageButton}`}
            >
              {el}
            </Button>
          ))}
        </div>
        <div className={`${styles.codeContainerBody}`}>
          <SyntaxHighlighter
            language="javascript"
            style={oneDark}
            showLineNumbers={true}
          >
            {getCode(spriteData, lang as string)}
          </SyntaxHighlighter>
        </div>
      </div>
    </div>
  );
};

export default DownloadsPage;
