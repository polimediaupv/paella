import styles from "./styles.module.css";

export function isHtml5VideoCompatible() {
    return true;
}

export default function Html5VideoCanvas ({ src }) {
    return (
        <video className={styles.videoContainer} src={src}></video>
    );
}
