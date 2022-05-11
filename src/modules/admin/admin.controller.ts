import {
  Body,
  Controller,
  Inject,
  Post,
  Put,
  UseGuards,
  Get,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { User } from 'src/commons/decorators/user.decorator';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { AdminService, StatusPost } from './admin.service';
import { CreatePostDto } from './dto/CreatePost.dto';
import { UpdatePostDto } from './dto/UpdatePost.dto';

@ApiTags('Admin')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('admin')
export class AdminController {
  constructor(
    @Inject('ADMIN_SERVICE') private readonly adminService: AdminService,
  ) {}

  //Get danh sách bài viết (của patient và admin)
  @Get('get-all-posts')
  getAllPosts(
    @User('id') idLogin: number,
    @Query('create_at') createAt = '2022-05-11',
    @Query('title') title = '',
    @Query('nick_name') nickName = '',
    @Query('typePost') typePost = 'success',
    @Query('typeSort') typeSort = 'desc',
    @Query('limit') limit = 10,
    @Query('page') page = 1,
  ) {
    return this.adminService.getAllPosts(
      idLogin,
      createAt,
      title,
      nickName,
      typePost,
      typeSort,
      limit,
      page,
    );
  }

  //Get danh sách bài viết (của patient và admin)
  @Get('get-all-posts-by-userId')
  getAllPostsByUserId(
    @User('id') idLogin: number,
    @Query('idUser') idUser: number,
    @Query('create_at') createAt = '2022-05-11',
    @Query('title') title = '',
    @Query('typePost') typePost = 'success',
    @Query('typeSort') typeSort = 'desc',
    @Query('limit') limit = 10,
    @Query('page') page = 1,
  ) {
    return this.adminService.getAllPostsByUserId(
      idLogin,
      idUser,
      createAt,
      title,
      typePost,
      typeSort,
      limit,
      page,
    );
  }

  //Admin tạo bài viết
  @Post('create-post')
  createPost(@User('id') id: number, @Body() createPost: CreatePostDto) {
    return this.adminService.createPost(id, createPost);
  }

  //Cập nhật bài viết của admin
  @Put('update-post/:idPost')
  async updatePost(
    @User('id') userId: number,
    @Param('idPost') idPost: number,
    @Body() updatePost: UpdatePostDto,
  ) {
    return this.adminService.updatePost(userId, idPost, updatePost);
  }

  //Xóa bài viết của admin
  @Delete('delete-post/:id')
  deletePost(@User('id') userId: number, @Param('id') id: number) {
    return this.adminService.deletePost(id, userId);
  }

  @Put('update-status-post/:idPost')
  async updateStatusPost(
    @Param('idPost') idPost: number,
    @Query('status') status: StatusPost,
  ) {
    return this.adminService.updateStatusPost(idPost, status);
  }
}
