import os
import sys
import pandas as pd

def read_csv_flexible(file_path):
    """Try to read a CSV with several encodings before giving up."""
    encodings_to_try = ['utf-8', 'utf-8-sig', 'latin1', 'cp1252']
    for enc in encodings_to_try:
        try:
            return pd.read_csv(file_path, encoding=enc)
        except UnicodeDecodeError:
            continue
    raise UnicodeDecodeError("All encoding attempts failed for " + file_path)

def concatenate_csvs(directory, output_file):
    """
    Concatenate all CSV files in a directory into one CSV file.
    Handles files with different headers and different encodings.
    """
    all_dfs = []
    
    for filename in os.listdir(directory):
        if filename.lower().endswith('.csv'):
            file_path = os.path.join(directory, filename)
            try:
                df = read_csv_flexible(file_path)
                df['source_file'] = filename
                all_dfs.append(df)
                print(f"✅ Loaded {filename} with {len(df)} rows and {len(df.columns)} columns.")
            except Exception as e:
                print(f"⚠️ Error reading {filename}: {e}")

    if not all_dfs:
        print("No valid CSV files found in the directory.")
        return

    combined_df = pd.concat(all_dfs, axis=0, ignore_index=True, sort=True)
    combined_df.to_csv(output_file, index=False)
    print(f"\n✅ Combined CSV written to: {output_file}")
    print(f"Total rows: {len(combined_df)} | Total columns: {len(combined_df.columns)}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python combine_csvs.py <directory_path> [output_file]")
        sys.exit(1)

    input_dir = sys.argv[1]
    output_csv = sys.argv[2] if len(sys.argv) > 2 else "combined_output.csv"

    if not os.path.isdir(input_dir):
        print(f"❌ Error: '{input_dir}' is not a valid directory.")
        sys.exit(1)

    concatenate_csvs(input_dir, output_csv)
