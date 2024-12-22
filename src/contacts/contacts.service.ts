import { Injectable } from '@nestjs/common';
import { Contact } from '@prisma/client';
import { PrismaService } from 'src/common/services/prisma/prisma.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';

@Injectable()
export class ContactsService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createContactDto: CreateContactDto): Promise<Contact> {
    return this.prismaService.contact.create({
      data: createContactDto,
    });
  }

  index() {
    return `This action returns all contacts`;
  }

  show(id: number) {
    return `This action returns a #${id} contact`;
  }

  update(id: number, updateContactDto: UpdateContactDto) {
    return `This action updates a #${id} contact`;
  }

  remove(id: number) {
    return `This action removes a #${id} contact`;
  }
}
