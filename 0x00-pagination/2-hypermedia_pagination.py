#!/usr/bin/env python3
"""Python file"""

import csv
import math
from typing import List


def index_range(page, page_size):
    """Returns a tuple containing the start
    and end index of a seeked page"""
    start_index = (page - 1) * page_size
    end_index = ((page - 1) * page_size) + page_size
    return (start_index, end_index)


class Server:
    """Server class to paginate a database of popular baby names."""

    DATA_FILE = "Popular_Baby_Names.csv"

    def __init__(self):
        self.__dataset = None

    def dataset(self) -> List[List]:
        """Cached dataset"""
        if self.__dataset is None:
            with open(self.DATA_FILE) as f:
                reader = csv.reader(f)
                dataset = [row for row in reader]
            self.__dataset = dataset[1:]

        return self.__dataset

    def get_page(self, page: int = 1, page_size: int = 10) -> List[List]:
        """Returns a page"""
        assert isinstance(page, int) and isinstance(page_size, int)
        assert page > 0 and page_size > 0

        indexes = index_range(page, page_size)
        data = self.dataset()
        try:
            result = data[indexes[0]:indexes[1]]
            return result
        except IndexError:
            return []

    def get_hyper(self, page: int = 1, page_size: int = 10) -> List[List]:
        """Returns a page"""
        assert isinstance(page, int) and isinstance(page_size, int)
        assert page > 0 and page_size > 0

        indexes = index_range(page, page_size)
        data = self.dataset()
        total_page = math.ceil(data.__len__() / page_size)

        try:
            result = data[indexes[0]:indexes[1]]
        except IndexError:
            result = []
        next_page = page + 1 if (page + 1) <= total_page else None
        prev_page = page - 1 if (page - 1) >= 2 else None

        dict_values = {
            "page_size": page_size,
            "page": page,
            "data": result,
            "next_page": next_page,
            "prev_page": prev_page,
            "total_pages": total_page,
        }
        return dict_values
