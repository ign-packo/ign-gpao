import json
from jsonschema import validate

# ...

def fonction_demo(dict_to_test, dict_valid):
    try:
        validate(dict_to_test, dict_valid)
    except Exception as valid_err:
        print("Validation KO: {}".format(valid_err))
        raise valid_err
    else:
        # Realise votre travail
        print("JSON validé")


if __name__ == '__main__':
    with open("./json_ok.json", "r") as fichier:
        dict_to_test = json.load(fichier)

    with open("./json_schema.json", "r") as fichier:
        dict_valid = json.load(fichier)

    fonction_demo(dict_to_test, dict_valid)
