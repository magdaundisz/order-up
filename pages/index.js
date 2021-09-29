import Head from "next/head";
import Image from "next/image";
import data from "../utils/data";
import Card from "@material-ui/core/Card";
import Link from "next/link";
import { CardContent, makeStyles } from "@material-ui/core";
import MenuItem from "../components/MenuItem";
import flatten from "lodash/flatten";

const useStyles = makeStyles({
  root: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
  },
});

export default function Home() {
  const classes = useStyles();

  let transformed = [];
  Object.values(data).map((arr) => arr.map((item) => transformed.push(item)));
  console.log("object entries", Object.entries(data));

  // map = [x, y, z] -> [fn(x), fn(y), fn(z)]
  // reduce = [x, y, z] -> A

  // const flattened = Object.values(data).reduce(
  //   (acc, nested) => [...acc, ...nested],
  //   []
  // );

  // console.log("flattened", flattened);

  // const map = (array, fn) => array.reduce((acc, x) => [...acc, fn(x)], []);

  return (
    <div>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div style={{ margin: "0 auto", width: 1200 }}>
        <div
          style={{
            padding: 30,
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gridTemplateRows: "repeat(auto-fill, 1fr)",
            gridGap: 20,
          }}
        >
          {transformed.map((item) => {
            return <MenuItem key={item.name} item={item} />;
          })}
        </div>
      </div>
    </div>
  );
}
