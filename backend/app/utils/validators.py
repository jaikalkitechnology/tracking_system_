import re

PHONE_REGEX = re.compile(r"^\+?[0-9]{7,15}$")
PINCODE_REGEX = re.compile(r"^[0-9]{4,10}$")


def is_valid_phone(phone: str) -> bool:
    return bool(PHONE_REGEX.match(phone))


def is_valid_pincode(pincode: str) -> bool:
    return bool(PINCODE_REGEX.match(pincode))
