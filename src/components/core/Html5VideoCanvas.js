
export function isHtml5VideoCompatible() {
    return true;
}

export default function Html5VideoCanvas ({ src }) {
    return (
        <video src={src}></video>
    );
}
