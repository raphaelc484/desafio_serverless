import { APIGatewayEvent } from "aws-lambda"

import { v4 as uuid } from "uuid"
import { hash } from "bcrypt"
import { documentClient } from "../../utils/dynamoClient.ts ";

export const handle = async (event: APIGatewayEvent) => {
  const { username, password } = JSON.parse(event.body)

  const response = await documentClient.scan({
    TableName: "users",
    ProjectionExpression: "username, id"
  }).promise()

  const [userAlreadyExists] = response.Items.filter(user => user.username === username)

  if (userAlreadyExists) return {
    statusCode: 409,
    body: JSON.stringify({
      error: "User Already Exists!"
    }),
    headers: {
      "Content-Type": "application/json"
    }
  }

  const user_id = uuid()

  await documentClient.put({
    TableName: "users",
    Item: {
      id: user_id,
      username,
      password: hash(password, 10)
    }
  }).promise()

  return {
    statusCode: 201,
    body: JSON.stringify({
      message: "User created successfully!",
      user: {
        id: user_id,
        username
      }
    }),
    headers: {
      "Content-Type": "application/json"
    }
  }

}