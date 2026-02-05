#!/bin/bash

# Check if a filename was provided
if [ -z "$1" ]; then
    echo "🚨 Usage: $0 <circom_file_name_without_extension>"
    echo "   Example: $0 my_circuit"
    exit 1
fi

# Assign the argument to a variable
CIRCUIT_NAME="$1"
CIRCUIT_DIR="$2"
CIRCUIT_FILE="${CIRCUIT_DIR}/${CIRCUIT_NAME}.circom"
JS_DIR="${CIRCUIT_DIR}/${CIRCUIT_NAME}_js"
GENERATE_WITNESS_JS="${JS_DIR}/generate_witness.js"
WITNESS_CALCULATOR_JS="${JS_DIR}/witness_calculator.js"
GENERATE_WITNESS_CJS="${JS_DIR}/generate_witness.cjs"
WITNESS_CALCULATOR_CJS="${JS_DIR}/witness_calculator.cjs"

# --- 1. Circom Compilation ---
echo "⚙️  Step 1: Compiling ${CIRCUIT_FILE}..."
circom "${CIRCUIT_FILE}" --r1cs --wasm --sym --c -o "./${CIRCUIT_DIR}"

# Check if compilation was successful
if [ $? -ne 0 ]; then
    echo "❌ Error during Circom compilation. Aborting."
    exit 1
fi

# --- 1.5. Rename and Modify JS files ---
echo "✏️  Step 1.5: Renaming .js files to .cjs and modifying import..."

# 1. Rename witness_calculator.js -> witness_calculator.cjs
if [ -f "${WITNESS_CALCULATOR_JS}" ]; then
    mv "${WITNESS_CALCULATOR_JS}" "${WITNESS_CALCULATOR_CJS}"
    echo "   - Renamed ${WITNESS_CALCULATOR_JS} to .cjs"
else
    echo "   - Note: ${WITNESS_CALCULATOR_JS} not found."
fi

# 2. Modify the import path in generate_witness.js
if [ -f "${GENERATE_WITNESS_JS}" ]; then
    echo "   - Modifying import in ${GENERATE_WITNESS_JS}..."
    
    # Use 'sed' to replace the import line
    # NOTE: The '-i' flag might need '-i ""' on macOS to prevent backup files.
    # We use a slightly safer 'sed' method for compatibility.
    sed -i.bak 's/witness_calculator.js/witness_calculator.cjs/g' "${GENERATE_WITNESS_JS}"
    
    # Remove the backup file created by sed (if it exists)
    if [ -f "${GENERATE_WITNESS_JS}.bak" ]; then
        rm "${GENERATE_WITNESS_JS}.bak"
    fi
    
    echo "   - Import path updated inside the file."

    # 3. Rename generate_witness.js -> generate_witness.cjs
    mv "${GENERATE_WITNESS_JS}" "${GENERATE_WITNESS_CJS}"
    echo "   - Renamed ${GENERATE_WITNESS_JS} to .cjs"
else
    echo "   - Warning: ${GENERATE_WITNESS_JS} not found. Skipping rename/modify."
fi

# --- 2. Witness Generation ---
WASM_FILE="${JS_DIR}/${CIRCUIT_NAME}.wasm"
# We now reference the .cjs file that has been modified
WITNESS_GENERATOR="${GENERATE_WITNESS_CJS}" 
INPUT_FILE="${CIRCUIT_DIR}/input.json" 
WITNESS_FILE="${CIRCUIT_DIR}/witness.wtns"

echo "✨ Step 2: Generating witness using ${WASM_FILE} and ${INPUT_FILE}..."

# Execute the Node.js command using the new .cjs file
node "${WITNESS_GENERATOR}" "${WASM_FILE}" "${INPUT_FILE}" "${WITNESS_FILE}"

# Check if witness generation was successful
if [ $? -ne 0 ]; then
    echo "❌ Error generating the witness. Check ${INPUT_FILE} and the node execution."
    exit 1
fi

# --- 3. Trusted setup ---
echo "⚙️  Step 3: Trusted setup..."
# snarkjs powersoftau new bn128 12 pot12_0000.ptau -v
# snarkjs powersoftau contribute pot12_0000.ptau pot12_0001.ptau --name="First contribution" -v
# snarkjs powersoftau prepare phase2 pot12_0001.ptau pot12_final.ptau -v
snarkjs powersoftau prepare phase2 ./powersOfTau28_hez_final_12.ptau pot12_final.ptau -v
snarkjs groth16 setup ${CIRCUIT_DIR}/${CIRCUIT_NAME}.r1cs pot12_final.ptau ${CIRCUIT_DIR}/${CIRCUIT_NAME}_0000.zkey
snarkjs zkey contribute ${CIRCUIT_DIR}/${CIRCUIT_NAME}_0000.zkey ${CIRCUIT_DIR}/${CIRCUIT_NAME}_0001.zkey --name="1st Contributor Name" -v
snarkjs zkey verify ${CIRCUIT_DIR}/${CIRCUIT_NAME}.r1cs pot12_final.ptau ${CIRCUIT_DIR}/${CIRCUIT_NAME}_final.zkey
snarkjs zkey export verificationkey ${CIRCUIT_DIR}/${CIRCUIT_NAME}_0001.zkey ${CIRCUIT_DIR}/verification_key.json

# --- 4. Generate Solidity Verifier ---
echo "📜 Generate the Solidty Verifier"
snarkjs zkey export solidityverifier ${CIRCUIT_DIR}/${CIRCUIT_NAME}_0001.zkey ${CIRCUIT_DIR}/verifier.sol
# --- 5. Create the proof ---
echo "🧾 Create the proof"
snarkjs groth16 prove ${CIRCUIT_DIR}/${CIRCUIT_NAME}_0001.zkey ${CIRCUIT_DIR}/witness.wtns ${CIRCUIT_DIR}/proof.json ${CIRCUIT_DIR}/public.json

# --- 6. Verify the proof ---
echo "✅ Verify the proof"
snarkjs groth16 verify ${CIRCUIT_DIR}/verification_key.json ${CIRCUIT_DIR}/public.json ${CIRCUIT_DIR}/proof.json
snarkjs zkey export soliditycalldata ${CIRCUIT_DIR}/public.json ${CIRCUIT_DIR}/proof.json
echo "✅ Process completed successfully."
