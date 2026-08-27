<?php

function request_positive_number($value, $maximum = 999)
{
	if (!is_scalar($value) || !is_numeric($value)) {
		return null;
	}
	$number = (float) $value;
	return $number > 0 && $number <= $maximum ? $number : null;
}

function request_nonnegative_number($value, $maximum = 999999)
{
	if (!is_scalar($value) || !is_numeric($value)) {
		return null;
	}
	$number = (float) $value;
	return $number >= 0 && $number <= $maximum ? $number : null;
}

function request_identifier($value)
{
	if (!is_string($value) && !is_int($value)) {
		return null;
	}
	$value = (string) $value;
	return preg_match('/^[A-Za-z0-9_.-]{1,64}$/', $value) ? $value : null;
}

function request_bounded_text($value, $maximumLength)
{
	if (!is_string($value)) {
		return '';
	}
	$value = trim($value);
	if (strlen($value) > $maximumLength) {
		throw new InvalidArgumentException('Text value is too long.');
	}
	return $value;
}
