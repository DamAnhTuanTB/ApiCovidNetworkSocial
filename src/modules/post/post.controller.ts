import { UserService } from 'src/modules/user/user.service';
import { CreatePostDto } from './dto/CreatePost.dto';
import { UpdatePostDto } from './dto/UpdatePost.dto';
import { CreateCommentPostDto } from './dto/CreateCommentPost.dto';
import { CreateLikeOrUnlikePostDto } from './dto/CreateLikeOrUnlikePost.dto';
import { CreateSaveOrUnsavePostDto } from './dto/CreateSaveOrUnsavePost.dto';
import { CreateLikeOrUnlikeCommentDto } from './dto/CreateLikeOrUnlikeComment.dto';
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
import { PostService } from './post.service';

@ApiTags('Post')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('post')
export class PostController {
  constructor(
    @Inject('POST_SERVICE') private readonly postService: PostService,
  ) {}

  //Người dùng hiện tại tạo bài viết
  @Post('create')
  createPost(@User('id') id: number, @Body() createPost: CreatePostDto) {
    return this.postService.createPost(id, createPost);
  }

  //Xóa bài viết của người dùng hiện tại
  @Delete('delete/:id')
  deletePost(@User('id') userId: number, @Param('id') id: number) {
    return this.postService.deletePost(id, userId);
  }

  //Cập nhật bài viết của người dùng hiện tại
  @Put('update-post/:idPost')
  async updatePost(
    @User('id') userId: number,
    @Param('idPost') idPost: number,
    @Body() updatePost: UpdatePostDto,
  ) {
    return this.postService.updatePost(userId, idPost, updatePost);
  }

  //Get danh sách bài viết của người dùng theo id (Không truyền id -> list post của idLogin)
  @Get('get-list-post-of-user')
  getListPostOfUser(
    @User('id') idLogin: number,
    @Query('idUser') idUser: number,
    @Query('type') type = 'success',
    @Query('limit') limit = 10,
    @Query('page') page = 1,
  ) {
    if (typeof idUser == 'undefined' || idUser == null) {
      const idGetListPost = idLogin;
      const idGetLikeSave = idLogin;
      return this.postService.getListPostOfUser(
        idGetListPost,
        idGetLikeSave,
        type,
        limit,
        page,
      );
    } else {
      const idGetListPost = idUser;
      const idGetLikeSave = idLogin;
      return this.postService.getListPostOfUser(
        idGetListPost,
        idGetLikeSave,
        type,
        limit,
        page,
      );
    }
  }

  //Get danh sách bài viết của những user khác
  @Get('get-all-posts')
  getALlPosts(
    @User('id') idLogin: number,
    @Query('freeText') freeText = '',
    @Query('sortBy') sortBy = 'create_at',
    @Query('limit') limit = 10,
    @Query('page') page = 1,
  ) {
    return this.postService.getALlPosts(idLogin, freeText, sortBy, limit, page);
  }

  //Get chi tiết bài viết
  @Get('get-post-detail/:idPost')
  getPostDetail(@User('id') idLogin: number, @Param('idPost') idPost: number) {
    return this.postService.getPostDetail(idLogin, idPost);
  }

  //Get danh sách comment trong bài viết
  @Get('get-all-comment-post')
  getAllCommentOfPost(
    @User('id') idLogin: number,
    @Query('idPost') idPost: number,
    @Query('limit') limit = 10,
    @Query('page') page = 1,
  ) {
    return this.postService.getAllCommentOfPost(idLogin, idPost, limit, page);
  }

  //Tạo comment cho bài viết
  @Post('create-comment')
  createCommentPost(
    @User('id') idLogin: number,
    @Body() createCommentPost: CreateCommentPostDto,
  ) {
    return this.postService.createCommentPost(idLogin, createCommentPost);
  }

  //Like or unlike post
  @Post('like-or-unlike-post')
  likeOrUnlikePost(
    @User('id') idLogin: number,
    @Body() createLikeOrUnlikePostDto: CreateLikeOrUnlikePostDto,
  ) {
    return this.postService.likeOrUnlikePost(
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
    return this.postService.saveOrUnsavePost(
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
    return this.postService.likeOrUnlikeComment(
      idLogin,
      createLikeOrUnlikeCommentDto,
    );
  }
}
