module.exports = (sequelize, DataTypes) => {
    const user = sequelize.define(
        "user",
        {
            userId: {
                field: "user_id",
                type: DataTypes.STRING,
                allowNull: false,
                primaryKey: true
            },
            userAccessId: {
                field: "user_access_id",
                type: DataTypes.STRING,
                allowNull: true
            },
            userRiderName: {
                field: "user_rider_name",
                type: DataTypes.STRING,
                allowNull: true
            },
            userGameType: {
                field: "user_game_type",
                type: DataTypes.STRING,
                allowNull: true
            },
            userGameAmount: {
                field: "user_game_amount",
                type: DataTypes.INTEGER,
                allowNull: true
            },
            userDataType: {
                field: "user_data_type",
                type: DataTypes.STRING,
                allowNull: true
            },
            userData: {
                field: "user_data",
                type: DataTypes.STRING,
                allowNull: true
            },
            userTrace: {
                field: "user_trace",
                comment: "유저 블록",
                type: DataTypes.STRING,
                allowNull: true
            }
        },
        {
            "tableName": "user_table"
        }
    );
    return user;
};
