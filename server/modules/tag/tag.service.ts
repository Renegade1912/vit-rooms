import { Event, Prisma } from '@prisma/client';

const tagWithRoom = Prisma.validator<Prisma.TagDefaultArgs>()({
    include: {
        room: {
            select: {
                id: true,
                name: true
            }
        }
    }
});

export type TagWithRoom = Prisma.TagGetPayload<typeof tagWithRoom>;

/**
 * Creates a new tag.
 *
 * @param mac - The MAC address of the tag.
 * @param desc - The description of the tag.
 * @param width - The width of the tag screen.
 * @param height - The height of the tag screen.
 * @param roomId - The ID of the room the tag is associated with (optional).
 * @returns A promise that resolves to the created tag.
 */
export async function createTag(
    mac: string,
    desc: string,
    width: number,
    height: number,
    roomId?: string
): Promise<TagWithRoom> {
    const tag = await prisma.tag.create({
        data: {
            mac,
            desc,
            width,
            height,

            room: roomId
                ? {
                      connect: {
                          id: roomId
                      }
                  }
                : undefined
        },
        include: {
            room: {
                select: {
                    id: true,
                    name: true
                }
            }
        }
    });

    return tag;
}

/**
 * Retrieves a tag by its ID.
 *
 * @param id - The ID of the tag to retrieve.
 * @returns A Promise that resolves to the retrieved tag, or null if no tag is found.
 */
export async function getTag(id: string): Promise<TagWithRoom | null> {
    const tag = await prisma.tag.findUnique({
        where: {
            id
        },
        include: {
            room: {
                select: {
                    id: true,
                    name: true
                }
            }
        }
    });

    return tag;
}

/**
 * Retrieves a list of tags based on the provided pagination parameters and filter.
 *
 * @param page - The page number.
 * @param perPage - The number of tags per page.
 * @param filter - The filter string to search for tags.
 * @returns A promise that resolves to an array of partial tag objects.
 */
export async function getFilteredTags(page: number, perPage: number, filter: string): Promise<TagWithRoom[]> {
    const tags = await prisma.tag.findMany({
        orderBy: {
            mac: 'asc'
        },
        skip: (page - 1) * perPage,
        take: perPage,
        select: {
            id: true,
            mac: true,
            desc: true,
            width: true,
            height: true,
            roomId: true,

            room: {
                select: {
                    id: true,
                    name: true
                }
            }
        },
        where: {
            OR: [
                {
                    mac: {
                        contains: filter
                    }
                },
                {
                    desc: {
                        contains: filter
                    }
                }
            ]
        }
    });

    return tags;
}

/**
 * Retrieves a list of all tags.
 *
 * @returns A Promise that resolves to an array of all tags.
 */
export async function getTags(): Promise<TagWithRoom[]> {
    const tags = await prisma.tag.findMany({
        orderBy: {
            mac: 'asc'
        },
        select: {
            id: true,
            mac: true,
            desc: true,
            width: true,
            height: true,
            roomId: true,

            room: {
                select: {
                    id: true,
                    name: true
                }
            }
        }
    });

    return tags;
}

/**
 * Retrieves the count of tags.
 *
 * @returns A Promise that resolves to the total number of tags.
 */
export async function getTagsCount(): Promise<number> {
    const count = await prisma.tag.count();

    return count;
}

/**
 * Deletes a tag with the specified ID.
 *
 * @param id - The ID of the tag to delete.
 * @returns A Promise that resolves when the tag is successfully deleted.
 */
export async function deleteTag(id: string): Promise<void> {
    await prisma.tag.delete({
        where: {
            id
        }
    });
}

/**
 * Updates a tag with the specified ID.
 *
 * @param id - The ID of the tag to update.
 * @param desc - The description of the tag.
 * @param mac - The MAC address of the tag.
 * @param width - The width of the tag screen.
 * @param height - The height of the tag screen.
 * @param roomId - The ID of the room the tag is associated with (optional).
 * @returns A Promise that resolves when the tag is successfully updated.
 */
export async function updateTag(
    id: string,
    desc: string,
    mac: string,
    width: number,
    height: number,
    roomId?: string
): Promise<TagWithRoom> {
    return await prisma.tag.update({
        where: {
            id
        },
        data: {
            desc,
            mac,
            width,
            height,

            room: roomId
                ? {
                      connect: {
                          id: roomId
                      }
                  }
                : {
                      disconnect: true
                  }
        },
        include: {
            room: {
                select: {
                    id: true,
                    name: true
                }
            }
        }
    });
}

/**
 * Unlinks a tag from a room.
 *
 * @param id - The ID of the tag to unlink.
 * @returns A Promise that resolves when the tag is successfully unlinked.
 */
export async function unlinkTag(id: string): Promise<TagWithRoom> {
    return await prisma.tag.update({
        where: {
            id
        },
        data: {
            room: {
                disconnect: true
            }
        },
        include: {
            room: {
                select: {
                    id: true,
                    name: true
                }
            }
        }
    });
}

/**
 * Retrieves a tag with its associated room and today's events.
 *
 * @param id - The ID of the tag.
 * @returns A promise that resolves to a TagWithEvents object or null if the tag is not found.
 */
export async function getTagEvents(id: string): Promise<Event[]> {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const tag = await prisma.tag.findUnique({
        where: {
            id
        },
        select: {
            room: {
                select: {
                    events: {
                        orderBy: {
                            start: 'asc'
                        },
                        where: {
                            date: {
                                gte: todayStart,
                                lte: todayEnd
                            }
                        }
                    }
                }
            }
        }
    });

    if (!tag || !tag.room) return [];

    return tag.room.events;
}
