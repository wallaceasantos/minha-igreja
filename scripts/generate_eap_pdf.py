"""
Script para gerar o diagrama EAP em PNG/PDF a partir do arquivo PlantUML.

Requisitos:
- Java instalado
- Arquivo scripts/plantuml.jar

Uso:
    python scripts/generate_eap_pdf.py
"""

import subprocess
import os
from PIL import Image


def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    puml_file = os.path.join(base_dir, "docs", "gerencia", "EAP.puml")
    jar_file = os.path.join(base_dir, "scripts", "plantuml.jar")
    output_dir = os.path.join(base_dir, "docs", "gerencia")

    # Gerar PNG com PlantUML
    print("Gerando diagrama PNG com PlantUML...")
    result = subprocess.run(
        ["java", "-jar", jar_file, "-tpng", puml_file],
        capture_output=True,
        text=True,
        cwd=output_dir,
    )
    if result.returncode != 0:
        print("Erro ao gerar PNG:")
        print(result.stderr)
        return

    # O PlantUML gera o arquivo com base no nome do diagrama
    png_file = os.path.join(output_dir, "EAP_MinhaIgreja.png")
    pdf_file = os.path.join(output_dir, "EAP_MinhaIgreja.pdf")

    if not os.path.exists(png_file):
        print(f"Arquivo PNG não encontrado: {png_file}")
        return

    # Converter PNG para PDF
    print("Convertendo PNG para PDF...")
    img = Image.open(png_file)
    if img.mode == "RGBA":
        background = Image.new("RGB", img.size, (255, 255, 255))
        background.paste(img, mask=img.split()[3])
        img = background
    elif img.mode != "RGB":
        img = img.convert("RGB")

    img.save(pdf_file, "PDF", resolution=100.0)
    print(f"PDF gerado com sucesso: {pdf_file}")


if __name__ == "__main__":
    main()
