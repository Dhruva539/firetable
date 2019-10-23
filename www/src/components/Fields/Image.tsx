import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import useUploader from "../../hooks/useFiretable/useUploader";

import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import { FieldType } from ".";
import IconButton from "@material-ui/core/IconButton";
import Grid from "@material-ui/core/Grid";
import AddIcon from "@material-ui/icons/AddAPhoto";
import CircularProgress from "@material-ui/core/CircularProgress";

import _findIndex from "lodash/findIndex";
// TODO:  indicate error state

// TODO: multi support

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: "flex",
      // flexDirection: "column",
      alignContent: "center",
      width: "100%",
    },
    uploadingContainer: {
      display: "flex",
      alignContent: "center",
      flexDirection: "row",
      // justifyItems: "space-between",
      justifyContent: "space-between",
    },
    progress: {
      margin: theme.spacing(3),
    },
    img: {
      "&:hover": {
        backgroundColor: "rgb(255, 0, 0, 0.42)",
      },
    },
  })
);

interface Props {
  value: any;
  row: {
    ref: firebase.firestore.DocumentReference;
    id: string;
    rowHeight: number;
  };
  onSubmit: Function;
  fieldType: FieldType;
  fieldName: string;
}

const Image = (props: Props) => {
  const classes = useStyles();
  const { fieldName, value, row, onSubmit } = props;
  const [uploaderState, upload] = useUploader();
  const { progress } = uploaderState;
  console.log(uploaderState);
  const [localImage, setLocalImage] = useState<string | null>(null);
  const onDrop = useCallback(acceptedFiles => {
    // Do something with the files
    const imageFile = acceptedFiles[0];
    if (imageFile) {
      upload(row.ref, fieldName, [imageFile], value);
      let url = URL.createObjectURL(imageFile);
      setLocalImage(url);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: ["image/png", "image/jpg", "image/jpeg"],
  });
  const dropzoneProps = getRootProps();

  const files = [...value];
  if (localImage) {
    files.push({ downloadURL: localImage, name: "localImage" });
  }
  return (
    <Grid className={classes.root} {...dropzoneProps} onClick={() => {}}>
      <input {...getInputProps()} />
      {value &&
        value.map((file: { name: string; downloadURL: string }) => (
          <div
            onClick={e => {
              const index = _findIndex(value, [
                "downloadURL",
                file.downloadURL,
              ]);
              value.splice(index, 1);
              onSubmit(value);
            }}
          >
            <img
              className={classes.img}
              key={file.name}
              style={{
                padding: `${row.rowHeight * 0.03}px`,
                height: `${row.rowHeight * 0.95}px`,
              }}
              src={file.downloadURL}
            />
          </div>
        ))}
      {progress === 0 && (
        <IconButton onClick={dropzoneProps.onClick}>
          <AddIcon />
        </IconButton>
      )}
      {progress < 100 ? (
        <div className={classes.progress}>
          <CircularProgress
            size={row.rowHeight * 0.5}
            variant="determinate"
            value={progress}
            color="secondary"
          />
        </div>
      ) : (
        <div />
      )}
    </Grid>
  );
};
export default Image;
