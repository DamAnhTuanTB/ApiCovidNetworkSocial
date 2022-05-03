import { UserService } from 'src/modules/user/user.service';
import { CreatePostDto } from './dto/CreatePost.dto';
import { UpdatePostDto } from './dto/UpdatePost.dto';
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

  //Get danh sách bài viết của người dùng hiện tại
  @Get('get-list-post-user-login')
  getListPostOfUser(
    @User('id') userId: number,
    @Query('type') type: string,
    @Query('limit') limit: number,
    @Query('page') page: number,
  ) {
    return this.postService.getListPostOfUser(userId, type, limit, page);
  }
}
