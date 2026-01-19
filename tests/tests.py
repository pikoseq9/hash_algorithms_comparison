import subprocess
import os
import hashlib
import random
import string
import time

ITERATIONS = 100
LANGUAGES = ['cpp', 'cs', 'python']
ALGORITHMS = ['md5', 'sha1', 'sha2']

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(CURRENT_DIR, '..', 'backend')

def generate_random_string(length=10):
    letters = string.ascii_letters + string.digits
    return ''.join(random.choice(letters) for i in range(length))

def get_expected_hash(algo, text):
    data = text.encode('utf-8')
    if algo == 'md5':
        return hashlib.md5(data).hexdigest()
    elif algo == 'sha1':
        return hashlib.sha1(data).hexdigest()
    elif algo == 'sha2':
        return hashlib.sha256(data).hexdigest()
    return ""

def test_single_executable(lang, algo):
    exe_name = f"{algo}.exe"
    exe_path = os.path.join(BACKEND_DIR, lang, exe_name)

    if not os.path.exists(exe_path):
        print(f"Pominięto: {lang}/{exe_name} (Plik nie istnieje)")
        return 0, ["File not found"]

    print(f"Testowanie: {lang}/{exe_name} ... ", end='', flush=True)
    
    passed = 0
    errors = []

    start_time = time.time()

    for i in range(ITERATIONS):
        input_text = generate_random_string(random.randint(5, 50))
        expected = get_expected_hash(algo, input_text)

        try:
            result = subprocess.run(
                [exe_path, input_text],
                capture_output=True,
                text=True,
                check=True
            )
            output = result.stdout.strip()

            if output.lower() == expected.lower():
                passed += 1
            else:
                errors.append(f"Wejście: '{input_text}' | Oczekiwano: {expected} | Otrzymano: {output}")

        except subprocess.CalledProcessError:
            errors.append(f"Błąd wykonania (crash) dla wejścia: '{input_text}'")
        except Exception as e:
            errors.append(f"Wyjątek systemowy: {str(e)}")

    duration = time.time() - start_time

    if passed == ITERATIONS:
        print(f"SUKCES ({passed}/{ITERATIONS}) [{duration:.2f}s]")
    else:
        print(f"BŁĄD ({passed}/{ITERATIONS})")
        for err in errors[:3]:
            print(f"   -> {err}")
        if len(errors) > 3:
            print(f"   -> ... i {len(errors) - 3} więcej błędów.")
    
    return passed == ITERATIONS

def main():
    print(f"--- Rozpoczynam testy poprawności ({ITERATIONS} prób na każdy plik) ---\n")
    
    total_files_tested = 0
    all_passed = True

    for lang in LANGUAGES:
        print(f"Folder: {lang.upper()}")
        for algo in ALGORITHMS:
            is_success = test_single_executable(lang, algo)
            if not is_success:
                all_passed = False
            total_files_tested += 1
        print("-" * 40)

    print("\n--- PODSUMOWANIE KOŃCOWE ---")
    if all_passed:
        print("Wszystkie dostępne pliki przeszły testy pomyślnie.")
    else:
        print("Niektóre pliki zwróciły błędne wyniki.")

if __name__ == "__main__":
    main()