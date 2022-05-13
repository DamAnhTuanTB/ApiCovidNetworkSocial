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
import { CreateCommentPostDto } from './dto/CreateCommentPost.dto';
import { CreateLikeOrUnlikeCommentDto } from './dto/CreateLikeOrUnlikeComment.dto';
import { CreateLikeOrUnlikePostDto } from './dto/CreateLikeOrUnlikePost.dto';
import { CreatePostDto } from './dto/CreatePost.dto';
import { CreateSaveOrUnsavePostDto } from './dto/CreateSaveOrUnsavePost.dto';
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
    @Query('create_at') createAt?: string,
    @Query('title') title = '',
    @Query('nick_name') nickName = '',
    @Query('typePost') typePost = 'success',
    @Query('typeSort') typeSort = 'desc',
    @Query('limit') limit?: number,
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
    @Query('limit') limit?: number,
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

  //Cập nhật trạng thái bài viết
  @Put('update-status-post/:idPost')
  async updateStatusPost(
    @Param('idPost') idPost: number,
    @Query('status') status: StatusPost,
  ) {
    return this.adminService.updateStatusPost(idPost, status);
  }

  //Get chi tiết bài viết
  @Get('get-post-detail/:idPost')
  getPostDetail(@User('id') idLogin: number, @Param('idPost') idPost: number) {
    return this.adminService.getPostDetail(idLogin, idPost);
  }

  //Get danh sách comment trong bài viết
  @Get('get-all-comment-post')
  getAllCommentOfPost(
    @User('id') idLogin: number,
    @Query('idPost') idPost: number,
    @Query('limit') limit?: number,
    @Query('page') page = 1,
  ) {
    return this.adminService.getAllCommentOfPost(idLogin, idPost, limit, page);
  }

  //Tạo comment cho bài viết
  @Post('create-comment')
  createCommentPost(
    @User('id') idLogin: number,
    @Body() createCommentPost: CreateCommentPostDto,
  ) {
    return this.adminService.createCommentPost(idLogin, createCommentPost);
  }

  //Like or unlike post
  @Post('like-or-unlike-post')
  likeOrUnlikePost(
    @User('id') idLogin: number,
    @Body() createLikeOrUnlikePostDto: CreateLikeOrUnlikePostDto,
  ) {
    return this.adminService.likeOrUnlikePost(
      idLogin,
      createLikeOrUnlikePostDto,
    );
  }

  //Like or unlike post
  @Post('save-or-unsave-post')
  saveOrUnsavePost(
    @User('id') idLogin: number,
    @Body() createSaveOrUnsavePostDto: CreateSaveOrUnsavePostDto,
  ) {
    return this.adminService.saveOrUnsavePost(
      idLogin,
      createSaveOrUnsavePostDto,
    );
  }

  //Like or unlike post
  @Post('like-or-unlike-comment')
  likeOrUnlikeComment(
    @User('id') idLogin: number,
    @Body() createLikeOrUnlikeCommentDto: CreateLikeOrUnlikeCommentDto,
  ) {
    return this.adminService.likeOrUnlikeComment(
      idLogin,
      createLikeOrUnlikeCommentDto,
    );
  }
}
