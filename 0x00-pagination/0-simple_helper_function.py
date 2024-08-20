#!/usr/bin/env python3
"""Python file"""


def index_range(page, page_size):
    """Returns a tuple containing the start
    and end index of a seeked page"""
    start_index = (page - 1) * page_size
    end_index = ((page - 1) * page_size) + page_size
    return (start_index, end_index)
