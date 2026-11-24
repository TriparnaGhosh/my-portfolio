#!/usr/bin/env python3
import argparse
from pathlib import Path

from PIL import Image
from rembg import new_session, remove

FRAME_COUNT = 3


def remove_background(input_path: Path, output_path: Path, frames_dir: Path | None) -> None:
    if input_path.resolve() == output_path.resolve():
        raise ValueError("Choose a different output path so the original sprite is preserved.")
    if output_path.suffix.lower() != ".png":
        raise ValueError("The output must be a PNG to retain transparency.")

    with Image.open(input_path) as source:
        sprite = source.convert("RGBA")
    if sprite.width % FRAME_COUNT:
        raise ValueError(
            f"Sprite width ({sprite.width}) is not divisible by {FRAME_COUNT}; "
            "check that it contains three equal-width frames."
        )

    session = new_session("u2netp")
    cleaned = remove(sprite, session=session)
    if cleaned.size != sprite.size:
        raise RuntimeError("Background removal changed the sprite dimensions.")
    cleaned = cleaned.convert("RGBA")

    output_path.parent.mkdir(parents=True, exist_ok=True)
    cleaned.save(output_path)

    if frames_dir:
        frames_dir.mkdir(parents=True, exist_ok=True)
        frame_width = cleaned.width // FRAME_COUNT
        for index in range(FRAME_COUNT):
            left = index * frame_width
            frame = cleaned.crop((left, 0, left + frame_width, cleaned.height))
            frame.save(frames_dir / f"frame-{index + 1}.png")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Remove the background from a three-frame horizontal sprite sheet."
    )
    parser.add_argument("input", type=Path, help="Original sprite-sheet image")
    parser.add_argument("output", type=Path, help="Transparent PNG output path")
    parser.add_argument(
        "--frames-dir",
        type=Path,
        help="Optional directory in which to save the three equal-width PNG frames",
    )
    args = parser.parse_args()
    remove_background(args.input, args.output, args.frames_dir)


if __name__ == "__main__":
    main()
