import * as crypto from "crypto";

export class hash {
    input: crypto.BinaryLike;

    constructor(input: crypto.BinaryLike) {
        this.input = input;
    }

    get identifier() {
        let hashed = crypto
            .createHash("sha256")
            .update(this.input)
            .digest("hex");

        return hashed.substring(
            0,
            hashed.length - Math.floor((hashed.length * 80) / 100)
        );
    }
}
